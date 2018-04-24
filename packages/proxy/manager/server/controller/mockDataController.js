const { Container } = require('typedi');
const { MockServiceToken } = require('lib-zan-proxy/lib/service')

/**
 * 数据文件相关api
 */
let instance;
module.exports = class MockDataController {
    static getInstance() {
        if (!instance) {
            instance = new MockDataController();
        }
        return instance;
    }
    constructor() {
        this.mockDataService = Container.get(MockServiceToken)
    }

    regist(router) {

        // 获取mock数据列表
        router.get('/data/getdatalist', async (ctx, next) => {
            let userId = ctx.userId;
            let dataList = await this.mockDataService.getMockDataList();
            ctx.body = {
                code: 0,
                data: dataList
            };
        });
        // 保存数据列表
        router.post('/data/savedatalist', async (ctx, next) => {
            await this.mockDataService.saveMockDataList(ctx.request.body);
            ctx.body = {
                code: 0
            };
        });

        // 读取数据文件
        router.get('/data/getdatafile', async (ctx, next) => {
            let data = await this.mockDataService.getMockDataByID(ctx.query.id);
            let content = ''
            if (data && data.content) {
                content = data.content
            }
            ctx.body = {
                code: 0,
                data: content
            };
        });
        // 保存数据文件
        router.post('/data/savedatafile', async (ctx, next) => {
            await this.mockDataService.saveDataFileContent(ctx.query.id, ctx.request.body.fields.content);
            ctx.body = {
                code: 0
            };
        });
        // 从http请求日志中保存 mock 数据
        // router.post('/data/savedatafromtraffic', async (ctx, next) => {
        //     let userId = ctx.userId;

        //     let content = await this.httpTrafficService.getResponseBody(userId, ctx.request.body.reqid);
        //     // 获取数据文件内容 在保存
        //     await this.mockDataService.add(
        //         ctx.request.body.id,
        //         ctx.request.body.name,
        //         ctx.request.body.contenttype,
        //         content);
        //     ctx.body = {
        //         code: 0
        //     };
        // });
    }
}