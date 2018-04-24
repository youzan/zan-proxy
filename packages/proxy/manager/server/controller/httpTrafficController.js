const ServiceRegistry = require("../../service");

let instance;
module.exports = class TrafficController {
    static getInstance() {
        if (!instance) {
            instance = new TrafficController();
        }
        return instance;
    }

    constructor() {
        this.httpTrafficService = ServiceRegistry.getHttpTrafficService();
    }

    regist(router) {
        // 获取响应body
        router.get('/traffic/getResponseBody', async (ctx, next) => {
            let userId = ctx.userId;
            let id = ctx.query.id;
            let content = await this.httpTrafficService.getResponseBody(userId, id);
            ctx.body = content;
        });

        router.get('/traffic/getRequestBody', async (ctx, next) => {
            let userId = ctx.userId;
            let id = ctx.query.id;
            let content = await this.httpTrafficService.getRequestBody(userId, id);
            ctx.body = content;
        });

        router.get('/traffic/stopRecord', async (ctx, next) => {
            let userId = ctx.userId;
            let stopRecord = ctx.query.stop;
            await this.httpTrafficService.setStopRecord(userId, stopRecord == 'true');
            ctx.body = {
                code: 0
            };
        });
        router.get('/traffic/setfilter', async (ctx, next) => {
            let userId = ctx.userId;
            let { path = '', host = '' } = ctx.query;
            await this.httpTrafficService.setFilter(userId, { path, host });
            ctx.body = {
                code: 0
            };
        });

        router.get('/traffic/clear', async (ctx, next) => {
            let userId = ctx.userId;
            await this.httpTrafficService.clear(userId);
            ctx.body = {
                code: 0
            };
        });

        // 获取请求body
        router.get('/traffic/getRequestBody', async (ctx, next) => {
            let userId = ctx.userId;
            let id = ctx.query.id;
            let content = await this.httpTrafficService.getRequestBody(userId, id);
            ctx.body = content;
        });
    }
};