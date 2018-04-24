const ServiceRegistry = require("../../service");
const Breakpoint = require("../../proxy/breakpoint");

let instance;
module.exports = class BreakpointController {
    static getInstance() {
        if (!instance) {
            instance = new BreakpointController();
        }
        return instance;
    }
    constructor() {
        this.breakpointService = ServiceRegistry.getBreakpointService();
        this.breakpoint = Breakpoint.getBreakpoint();
    }

    regist(router) {
        // 将请求发送给服务器 获取响应内容
        router.get('/breakpoint/setRequestContent', async (ctx, next) => {
            let userId = ctx.userId;
            let instanceId = ctx.query.instanceId;
            let requestContent = ctx.body;
            await this.breakpointService.setInstanceRequestContent(instanceId, requestContent);
            await this.breakpointService.getServerResponse(instanceId);
            this.body = {
                code: 0
            };
        });
        // 将请求发送给浏览器
        router.get('/breakpoint/setResponseContent', async (ctx, next) => {
            let userId = ctx.userId;
            let instanceId = ctx.query.instanceId;
            let responseContent = ctx.body;
            await this.breakpointService.setInstanceServerResponseContent(instanceId, responseContent);
            await this.breakpointService.sendToClient(instanceId);
            this.body = '';
        });
        // 保存断点
        router.get('/breakpoint/save', async (ctx, next) => {
            let userId = ctx.userId;
            let breakpoint = ctx.body;
            await this.breakpointService.saveBreakpoint({
                userId,
                connectionId: breakpoint.connectionId,
                match: breakpoint.match,
                requestBreak: breakpoint.requestBreak,
                responseBreak: breakpoint.responseBreak,
                breakpointId: breakpoint.breakpointId,
            });
            this.body = {
                code: 0
            };
        });
        // 删除断点
        router.get('/breakpoint/delete', async (ctx, next) => {
            let userId = ctx.userId;
            let breakpointId = ctx.query.breakpointId;
            await this.breakpointService.deleteBreakpoint(userId, breakpointId);
            this.body = {
                code: 0
            };
        });

        // 获取用户的所有断点列表
        router.get('/breakpoint/getAll', async (ctx, next) => {
            let userId = ctx.userId;
            let breakpoints =
                await this.breakpointService.getUserBreakPoints(userId);
            this.body = {
                code: 0,
                data: breakpoints
            };
        });
    }
}