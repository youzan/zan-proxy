const ServiceRegistry = require( "../../service");

let instance;
module.exports = class HostController {
    static getInstance() {
        if (!instance) {
            instance = new HostController();
        }
        return instance;
    }
    constructor() {

        this.hostService = ServiceRegistry.getHostService();

    }

    regist(router) {

        //{
        //    name:name,
        //    description:description
        //}
        router.post('/host/create', async (ctx, next) => {
            let userId = ctx.userId;

            let result = await this.hostService.createHostFile(userId, ctx.request.body.name
                , ctx.request.body.description);
            ctx.body = {
                code: result ? 0 : 1,
                msg: result ? '' : '文件已存在'
            };
        });
        router.get('/host/filelist', async (ctx, next) => {
            let userId = ctx.userId;
            let hostList = await this.hostService.getHostFileList(userId);
            ctx.body = {
                code: 0,
                list: hostList
            };
        });
        // /host/deletefile?name=${name}
        router.get('/host/deletefile', (ctx, next) => {
            let userId = ctx.userId;
            this.hostService.deleteHostFile(userId, ctx.query.name);
            ctx.body = {
                code: 0
            };
        });
        // /host/usefile?name=${name}
        router.get('/host/usefile', async (ctx, next) => {
            let userId = ctx.userId;
            await this.hostService.setUseHost(userId, ctx.query.name);
            ctx.body = {
                code: 0
            };
        });
        // /host/getfile?name=${name}
        router.get('/host/getfile', async (ctx, next) => {
            let userId = ctx.userId;
            let hostFile = await this.hostService.getHostFile(userId, ctx.query.name);
            ctx.body = {
                code: 0,
                data: hostFile
            };
        });
        // /host/savefile?name=${name} ,content
        router.post('/host/savefile', (ctx, next) => {
            let userId = ctx.userId;
            this.hostService.saveHostFile(userId, ctx.query.name, ctx.request.body);
            ctx.body = {
                code: 0
            };
        });
    }
}