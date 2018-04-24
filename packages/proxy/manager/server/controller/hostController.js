const { Container } = require('typedi')
const { HostServiceToken } = require("lib-zan-proxy/lib/service")

let instance;
module.exports = class HostController {
    static getInstance() {
        if (!instance) {
            instance = new HostController();
        }
        return instance;
    }
    constructor() {
        this.hostService = Container.get(HostServiceToken)
    }
    regist(router) {

        // {
        //    name:name,
        //    description:description
        // }
        router.post('/host/create', async (ctx, next) => {
            const { name, description } = ctx.request.body
            try {
                let result = await this.hostService.createHostFile(name, description);
                ctx.body = {
                    code: result ? 0 : 1,
                    msg: result ? '' : '文件已存在'
                };
            } catch(e) {
                ctx.body = {
                    code: 1,
                    msg: '创建失败'
                }
            }
        });
        router.get('/host/filelist', async (ctx, next) => {
            let hostList = await this.hostService.getHostFileList();
            ctx.body = {
                code: 0,
                list: hostList
            };
        });
        // /host/deletefile?name=${name}
        router.get('/host/deletefile', async (ctx, next) => {
            await this.hostService.deleteHostFile(ctx.query.name);
            ctx.body = {
                code: 0
            };
        });
        // /host/usefile?name=${name}
        router.get('/host/usefile', async (ctx, next) => {
            await this.hostService.setUseHost(ctx.query.name);
            ctx.body = {
                code: 0
            };
        });
        // /host/getfile?name=${name}
        router.get('/host/getfile', async (ctx, next) => {
            let hostFile = await this.hostService.getHostFile(ctx.query.name);
            ctx.body = {
                code: 0,
                data: hostFile
            };
        });
        // /host/savefile?name=${name} ,content
        router.post('/host/savefile', async (ctx, next) => {
            await this.hostService.saveHostFile(ctx.query.name, ctx.request.body);
            ctx.body = {
                code: 0
            };
        });
    }
}