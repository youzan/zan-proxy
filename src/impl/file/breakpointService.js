const EventEmitter = require("events");
const _ = require("lodash");
const path = require("path");
const fileUtils = require("../../core/utils/file");
const Remote = require('../../core/utils/remote');

/**
 * 记录三个维护的数据
 * 1、用户打开的断点页面数（连接数）
 * 2、断点请求
 * 3、断点
 * Created by tsxuehu on 8/3/17.
 */
module.exports = class BreakpointService extends EventEmitter {

    constructor({ appInfoService, logService }) {
        super();
        this.appInfoService = appInfoService;
        this.currentConnectionId = 10;// 连接id
        this.currentInstanceId = 3000;// 断点实例id

        this.remote = Remote.getInstance();

        this.appInfoService = appInfoService;
        let proxyDataDir = this.appInfoService.getProxyDataDir();
        // 监控数据缓存目录
        this.breakpointSaveDir = path.join(proxyDataDir, "breakpoint");
        /**
         * 断点id-> 断点
         * 断点格式如下：
         * let breakpoint = {
         *   id,
         *   enable: true, // 是否开启断点
         *   match, // 匹配
         *   requestBreak, // 请求断点
         *   responseBreak, // 响应断点
         *   userId: '', // 设置断点的用户id
         *   connectionId,// 界面连接id
         *   maxInstanceCount,// 断点最大实例数
         *};
         */
        this.breakpoints = {}; // 断点 userId -> { id -> breakpoint }
        // 记录断点的示例数目
        this.breakpointInsCnt = {}; // 断点 breakpointId -> Inscount

        /**
         * 断点实例id -> 断点实例
         * let instance = {
         *   id: instanceId,
         *   breakpointId,
         *   clientIp,
         *   href,
         *   userId,
         *   method,
         *   gettedServerResponse: false, // 有没有发送给服务器
         *   sendedToClient: false, // 有没有发送给浏览器
         *   requestContent: {},// 浏览器请求内容 （格式参见 HttpHandle._getRequestContent 函数）
         *   responseContent: {}// 服务器响应内容
         *}
         */
        this.instances = {}; // 断点实例  id -> instance

        this.userConnectionMap = {}; // userId -> [connectionId, connectionId ...]
    }

    async start() {
        let breakpointMap = await fileUtils.getJsonFileContentInDir(this.breakpointSaveDir);
        _.forEach(breakpointMap, (content, fileName) => {
            let userId = fileName.slice(0, -5);
            this.breakpoints[userId] = content;
        });
    }

    /**
     * 保存断点
     * @param userId
     * @param breakpoints 要保存的断点，如果有id 则是update
     */
    async saveBreakpoint({
                             breakpointId,
                             userId,
                             connectionId,
                             match,
                             maxInstanceCount = 1, // 默认只断一次
                             requestBreak = false,
                             responseBreak = false
                         }) {
        let id = breakpointId;
        if (!id) {
            id = Date.now();
        }
        let breakpoint = {
            id,
            enable: true, // 是否开启断点
            match, // 匹配
            requestBreak, // 请求断点
            responseBreak, // 响应断点
            maxInstanceCount,
            userId // 设置断点的用户id
        };
        let userBreakPoints = this.breakpoints[userId] || {};
        userBreakPoints[id] = breakpoint;

        // 断点 userId -> { id -> breakpoint }
        this.breakpoints[userId] = userBreakPoints;

        // 保存断点
        let filePath = this._getBreakPointSaveFilePath(userId);
        await fileUtils.writeJsonToFile(filePath, userBreakPoints);

        this.emit('breakpoint-save', userId, breakpoint);
    }

    getBreakpoint(userId, breakpointId) {
        return this.breakpoints[userId][breakpointId];
    }

    // 删除断点；清理断点实例；发送事件通知删除的断点，
    async deleteBreakpoint(userId, breakpointId) {
        // 删除断点
        delete this.breakpoints[userId][breakpointId];
        // 删除断点的示例数目
        delete this.breakpointInsCnt[breakpointId];
        // 删除断点实例
        let toDeleteInstance = [];
        _.forEach(this.instances, instance => {
            if (instance.breakpointId == breakpointId) {
                toDeleteInstance.push(instance.id);
            }
        });
        _.forEach(toDeleteInstance, id => {
            delete this.instances[id];
        });

        // 保存断点
        let filePath = this._getBreakPointSaveFilePath(userId);
        await fileUtils.writeJsonToFile(filePath, this.breakpoints[userId]);

        this.emit('breakpoint-delete', userId, breakpointId, toDeleteInstance);
        // 返回删除的instance id
        return toDeleteInstance;
    }

    /**
     * 获取用户的所有断点
     * @param userId
     * @private
     */
    getUserBreakPoints(userId) {
        return this.breakpoints[userId];
    }

    // 断点实例
    addInstance({ breakpointId, clientIp, href, method, userId }) {

        // 分配断点实例id
        let instanceId = (this.currentInstanceId++) + '';
        let instance = {
            id: instanceId,
            breakpointId,
            userId,
            clientIp,
            href,
            method,
            gettedServerResponse: false, // 有没有发送给服务器
            sendedToClient: false, // 有没有发送给浏览器
            requestContent: {},// 浏览器请求内容 （格式参见 HttpHandle._getRequestContent 函数）
            responseContent: {}// 服务器响应内容
        };

        this.instances[instanceId] = instance;

        // 记录断点实例数量
        let instanceCnt = this.breakpointInsCnt[breakpointId] || 0;
        instanceCnt++;
        this.breakpointInsCnt[breakpointId] = instanceCnt;

        // 触发断点列表变化通知
        // (分布式环境中，向zookeeper推送通知，repository监听zookeeper通知，然后推送消息给浏览器)
        this.emit('instance-add', userId, breakpointId, instance);
        return instanceId;
    }

    /**
     * 将请求数据发送给服务端,获取服务器返回内容
     */
    async getServerResponse(instanceId) {
        let requestContent = this.getInstanceRequestContent(instanceId);
        let responseContent = {};
        await this.remote.cacheFromRequestContent({
            requestContent, toClientResponse: responseContent
        });
        return responseContent;
    }

    // 将相应内容发送给浏览器，时间监听这具体执行发送操作
    sendedToClient(instanceId) {
        let instance = this.instances[instanceId];
        instance.sendedToClient = true;
        // 记录活跃断点实例数量
        let instanceCnt = this.breakpointInsCnt[instance.breakpointId] || 0;
        instanceCnt--;
        this.breakpointInsCnt[instance.breakpointId] = instanceCnt;

        this.emit('instance-sended-to-client', instanceId);
    }

    sendInstanceToClient(instanceId) {
        this.emit('send-instance-to-client', instanceId);
    }

    /**
     * 删除实例
     * @param instanceId
     */
    deleteInstance(instanceId) {
        let instance = this.instances[instanceId];
        delete this.instances[instanceId];
        this.emit('instance-delete', instance.userId, instance.breakpointId, instanceId);
    }

    /**
     * 获取请求内容
     * @param instanceId
     */
    getInstanceRequestContent(instanceId) {
        return this.instances[instanceId].requestContent;
    }

    /**
     * 获取响应内容
     * @param instanceId
     * @returns {responseContent|{}|*}
     */
    getInstanceResponseContent(instanceId) {
        return this.instances[instanceId].responseContent;
    }

    /**
     * 设置断点的服务器返回内容
     * @param instanceId
     * @param responseContent
     */
    setInstanceServerResponseContent(instanceId, responseContent) {
        let instance = this.instances[instanceId];

        let breakpointId = instance['breakpointId'];
        let userId = instance['userId'];
        let breakpoint = this.breakpoints[userId][breakpointId];

        instance.responseContent = responseContent;
        instance.gettedServerResponse = true;
        if (breakpoint.responseBreak) {
            this.emit('instance-set-server-response', userId, breakpointId, instanceId, responseContent);
        }
    }

    /**
     * 设置断点实例请求内容
     */
    setInstanceRequestContent(instanceId, requestContent) {
        let instance = this.instances[instanceId];
        // 找出断点关联的实例
        let breakpointId = instance['breakpointId'];
        let userId = instance['userId'];
        let breakpoint = this.breakpoints[userId][breakpointId];

        instance.requestContent = requestContent;
        // 如果是请求断点，则将内容发送给界面
        if (breakpoint.requestBreak) {
            this.emit('instance-set-request-content', userId, breakpointId, instanceId, requestContent);
        }
    }

    /**
     * 为用户分配一个连接id
     * @param userId
     */
    newConnectionId(userId) {
        let id = (this.currentConnectionId++) + '';
        let connections = this.userConnectionMap[userId] || [];
        connections.push(id);
        this.userConnectionMap[userId] = connections;
        return id;
    }

    /**
     * 用户关闭连接，删除该链接的id
     * @param userId
     * @param connectionId
     */
    connectionClosed(userId, connectionId) {
        let connections = this.userConnectionMap[userId] || [];
        _.remove(connections, n => {
            return n == connectionId;
        });
        this.userConnectionMap[userId] = connections;
    }

    /**
     * 根据请求匹配断点
     * @param clientIp
     * @param method
     * @param urlObj
     * @returns {Promise.<*>}
     */
    getBreakpointId(userId, method, urlObj) {
        let connectionsCnt = this.getUserConnectionCount(userId);
        // 没有断点界面，则断点不生效
        if (connectionsCnt == 0) return -1;
        let userBreakPoints = this.getUserBreakPoints(userId);
        let finded = _.find(userBreakPoints, (breakpoint, id) => {
                // 断点被启用
                if (!breakpoint.enable) {
                    return false;
                }
                // 断点实例数没超过限制
                let insCnt = this.breakpointInsCnt[id] || 0;
                if (insCnt >= breakpoint.maxInstanceCount) {
                    return false;
                }
                // 断点方法匹配 断点url匹配
                return this._isMethodMatch(method, breakpoint.method)
                    && this._isUrlMatch(urlObj.href, breakpoint.match);
            }) || { id: -1 };
        return finded.id;
    }

    // 请求的方法是否匹配规则
    _isMethodMatch(reqMethod, breakpointMethod) {
        let loweredReqMethod = _.lowerCase(reqMethod);
        let loweredBreakpointMethod = _.lowerCase(breakpointMethod);
        return loweredReqMethod == loweredBreakpointMethod
            || !breakpointMethod;
    }

    // 请求的url是否匹配规则
    _isUrlMatch(reqUrl, breakpointMatchStr) {
        return breakpointMatchStr && (reqUrl.indexOf(breakpointMatchStr) >= 0
            || (new RegExp(breakpointMatchStr)).test(reqUrl));
    }

    /**
     * 获取用户的链接总数
     * @param userId
     * @returns {Number}
     * @private
     */
    getUserConnectionCount(userId) {
        return (this.userConnectionMap[userId] || []).length;
    }

    _getBreakPointSaveFilePath(userId) {
        return path.join(this.breakpointSaveDir, `${userId}.json`);
    }
};