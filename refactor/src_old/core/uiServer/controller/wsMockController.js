const ServiceRegistry = require("../../service");

let instance;
module.exports = class WsMockController {
    static getInstance() {
        if (!instance) {
            instance = new WsMockController();
        }
        return instance;
    }
    constructor() {
        this.wsMockService = ServiceRegistry.getWsMockService();
    }

    regist(router) {
        // 开启调试会话
        router.get('/wsMock/opensession', async (ctx, next) => {
            let userId = ctx.userId;
            let sessionId = this.wsMockService.openSession(userId, debugClient.id, urlPattern);
            this.sendAssignedSessionIdToUser(userId, urlPattern, sessionId);
            this.body = '';
        });
        // 关闭调试会话
        router.get('/wsMock/closesession', async (ctx, next) => {
            let userId = ctx.userId;
            this.wsMockService.closeSession(sessionId);
            this.body = '';
        });
        // 调试消息
        router.get('/wsMock/debuggermsg', async (ctx, next) => {
            let userId = ctx.userId;
            this.wsMockService.sendToPageMsg(sessionId, data);
            this.body = '';
        });
    }
}