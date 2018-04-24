/**
 * Created by tsxuehu on 8/3/17.
 */
const fs = require("fs");
const path = require("path");
const rimraf = require("rimraf");
const _ = require("lodash");
const fileUtil = require("../../core/utils/file");
const logCountPerUser = 500;
const EventEmitter = require("events");
/**
 * 缓存监控数据、发送给监控窗
 * 记录用户打开的监控窗数量
 * 每个用户最多只记录500个请求，超过500个后 不在记录
 * @type {HttpTrafficRepository}
 */
module.exports = class HttpTrafficService extends EventEmitter {

    constructor({ userService, appInfoService }) {
        super();
        this.userService = userService;
        this.appInfoService = appInfoService;
        // http请求缓存数据 userId - > [{record}，{record}，{record}]
        this.cache = {};
        // 用户的请求id  一个用户可以关联多个请求设备，用户的请求分配唯一个一个请求id
        this.userRequestPointer = {};
        // 记录用户的监视窗数量
        this.userMonitorCount = {};

        let proxyDataDir = this.appInfoService.getProxyDataDir();
        // 监控数据缓存目录
        this.trafficDir = path.join(proxyDataDir, "traffic");
        this.filterMap = {};
        this.stopRecord = {};

        // 创建定时任务，推送日志记录
        setInterval(_ => {
            this.sendCachedData();
        }, 2000);
    }

    start() {
        // 删除缓存
       /* rimraf.sync(this.trafficDir);
        fs.mkdirSync(this.trafficDir);*/
    }

    getFilter(userId) {
        let filters = this.filterMap[userId] || { host: '', path: '' };
        return  filters;
    }

    setFilter(userId, filter) {
        this.filterMap[userId] = filter;
        this.emit("filter", userId, filter);
    }

    getStatus(userId) {
        return {
            stopRecord: this.stopRecord[userId] || false,
            overflow: this.userRequestPointer[userId] > logCountPerUser
        };
    }

    setStopRecord(userId, stop) {
        this.stopRecord[userId] = stop;
        // 发送通知
        this.emit("state-change", userId, this.getStatus(userId));
    }

    clear(userId) {
        this.userRequestPointer[userId] = 0;
        // 发送通知
        this.emit("clear", userId);
    }

    // 将缓存数据发送给用户
    sendCachedData() {
        _.forEach(this.cache, (rows, userId) => {
            this.emit("traffic", userId, rows);
        });
        this.cache = {};
    }

    // 为请求分配id
    getRequestId(userId, urlObj) {
        // 处于停止记录状态 则不返回id
        if (this.stopRecord[userId]) return -1;

        // 获取当前ip
        let id = this.userRequestPointer[userId] || 0;

        // 超过500个请求则不再记录
        if (id > logCountPerUser) {
            return -1;
        }

        let filter = this.getFilter(userId);
        let { path, host } = urlObj;
        if (path.indexOf(filter.path) > -1 && host.indexOf(filter.host) > -1) {
            id++;
            this.userRequestPointer[userId] = id;
            if (id > logCountPerUser) {
                let state = this.getStatus(userId);
                // 向监控窗推送通知
                this.emit("state-change", userId, state);
            }
            return id;
        }
        return -1;
    }

    resetRequestId(userId) {
        this.userRequestPointer[userId] = 0;
    }

    // 获取监控窗口的数量，没有监控窗口 则不做记录
    hasMonitor(userId) {
        let cnt = this.userMonitorCount[userId] || 0;
        return cnt > 0;
    }

    // 用户监控窗数加1
    incMonitor(userId) {
        let cnt = this.userMonitorCount[userId] || 0;
        if (cnt == 0) {
            this.resetRequestId(userId);
        }
        cnt++;
        this.userMonitorCount[userId] = cnt;
    }

    // 用户监控窗数减一
    decMonitor(userId) {
        let cnt = this.userMonitorCount[userId] || 0;
        cnt--;
        this.userMonitorCount[userId] = cnt;
    }

    // 记录请求
    async requestBegin({ id, userId, clientIp, method, httpVersion, urlObj, headers }) {
        let queue = this.cache[userId] || [];
        // 原始请求信息
        queue.push({
            id: id,
            originRequest: Object.assign({
                clientIp,
                method,
                httpVersion,
                headers
            }, urlObj)
        });

        this.cache[userId] = queue;
    }

    // 记录请求body
    async actualRequest({ userId, id, requestData, originBody }) {
        // 将body写文件

        let body = requestData.body;
        delete requestData.body;

        let queue = this.cache[userId] || [];
        queue.push({
            id: id,
            requestData
        });
        this.cache[userId] = queue;

        if (body) {
            let bodyPath = this.getRequestBodyPath(userId, id);
            await fileUtil.writeFile(bodyPath, body);
        }
        if (originBody) {
            let bodyPath = this.getOriginRequestBodyPath(userId, id);
            await fileUtil.writeFile(bodyPath, originBody);
        }
    }

    // 记录响应
    async serverReturn({ userId, id, toClientResponse }) {
        let queue = this.cache[userId] || [];
        let {
            statusCode,
            headers,
            receiveRequestTime,
            dnsResolveBeginTime,
            remoteRequestBeginTime,
            remoteResponseStartTime,
            remoteResponseEndTime,
            requestEndTime,
            remoteIp,
            body
        } = toClientResponse;
        queue.push({
            id: id,
            response: {
                statusCode,
                headers,
                receiveRequestTime,
                dnsResolveBeginTime,
                remoteRequestBeginTime,
                remoteResponseStartTime,
                remoteResponseEndTime,
                requestEndTime,
                remoteIp
            }
        });

        this.cache[userId] = queue;

        if (body) {
            let bodyPath = this.getResponseBodyPath(userId, id);
            await fileUtil.writeFile(bodyPath, body);
        }
    }

    /**
     * 获取请求的请求内容
     * @param userId
     * @param requestId
     */
    async getRequestBody(userId, requestId) {
        let saveRequestPath = this.getRequestBodyPath(userId, requestId);
        return await fileUtil.readFile(saveRequestPath);
    }

    /**
     * 获取请求的请求内容
     * @param userId
     * @param requestId
     */
    async getResponseBody(userId, requestId) {
        let saveResponsePath = this.getResponseBodyPath(userId, requestId);
        return await fileUtil.readFile(saveResponsePath);
    }

    // 获取请求记录path
    getRequestBodyPath(userId, requestId) {
        return path.join(this.trafficDir, userId + '_' + requestId + '_req_body');
    }

    getOriginRequestBodyPath() {
        return path.join(this.trafficDir, userId + '_' + requestId + '_req_body_origin');
    }

    // 获取响应记录path
    getResponseBodyPath(userId, requestId) {
        return path.join(this.trafficDir, userId + '_' + requestId + '_res_body');
    }
};