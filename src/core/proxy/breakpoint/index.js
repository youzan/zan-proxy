const ServiceRegistry = require("../../service");
const sendSpecificToClient = require("../../utils/sendSpecificToClient");
const _ = require("lodash");
/**
 * 断点处理
 * 可在两个地方设置断点 request 、 response
 * request: 修改请求，然后再发送到服务器
 * response: 修改服务器的响应，然后再发送给浏览器
 *
 * 工作流程：
 * 将request、response发送给breakpoint repository
 * 监听breakpoint repository事件，
 */
let breakpoint;
module.exports = class Breakpoint {
    static getBreakpoint() {
        if (!breakpoint) {
            breakpoint = new Breakpoint();
        }
        return breakpoint;
    }

    constructor() {
        // 记录客户端的请求、响应对象
        this.instanceReqRes = {};

        this.breakpointService = ServiceRegistry.getBreakpointService();

        // 删除断点后，释放断点实例
        this.breakpointService.on('breakpoint-delete', (userId, breakpointId, instanceIds) => {
            this.endRequest(instanceIds);
        });
        this.breakpointService.on('instance-delete', (userId, breakpointId, instanceId) => {
            this.endRequest([instanceId]);
        });
        // 将请求发送给客户端
        this.breakpointService.on('send-instance-to-client', (instanceId) => {
            this.sendToClient(instanceId);
        });
    }

    async run({
                  req, res, breakpointId, requestContent, urlObj, clientIp, userId
              }) {
        // 保存请求的req 和 res
        let instanceId = this.breakpointService.addInstance({
            breakpointId,
            method: req.method,
            clientIp,
            href: urlObj.href,
            userId
        });
        this.instanceReqRes[instanceId] = { req, res };

        let breakpoint = await this.breakpointService.getBreakpoint(userId, breakpointId);

        // 放入repository，若有请求断点，函数返回
        this.breakpointService.setInstanceRequestContent(instanceId, requestContent);
        if (breakpoint.requestBreak) return;

        // 获取服务器端内容
        let responseContent = await this.breakpointService.getServerResponse(breakpointId);
        this.breakpointService.setInstanceServerResponseContent(instanceId, responseContent);
        // 是否有响应断点，若有则放入repository，函数返回
        if (breakpoint.responseBreak) return;
        // 向客户端发送请求


        // 响应浏览器（一个空断点会执行到这一步）
        await this.sendToClient(instanceId);

        // 通知请求运行结束记录信息
        this.breakpointService.sendedToClient(instanceId);

    }

    /**
     * 将内容发送给浏览器
     * @param id
     */
    sendToClient(instanceId) {
        // 响应浏览器
        let instance = this.instanceReqRes[instanceId];
        let res = instance.res;
        let responseContent = this.breakpointService.getInstanceResponseContent(instanceId);
        sendSpecificToClient({
            res, statusCode: 200, headers: responseContent.headers, content: responseContent.body
        });
        // 删除
        delete this.instanceReqRes[instanceId];
    }

    /**
     * 用户删除断点时，断点关联的请求被删除
     * @param instanceIds
     */
    endRequest(instanceIds) {
        for (let instanceId of instanceIds) {
            let instance = this.instanceReqRes[instanceId];
            if (!instance) continue;
            let res = instance.res;
            sendSpecificToClient({
                res, statusCode: 500, headers: { breakpoint: "user close breakpoint" }, content: "user close breakpoint"
            });
            // 删除
            delete this.instanceReqRes[instanceId];
        }
    }
};