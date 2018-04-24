const ServiceRegistry = require("../../service");
const gitlab = require("../../utils/gitlab");

let instance;
module.exports = class TrafficController {
    static getInstance() {
        if (!instance) {
            instance = new TrafficController();
        }
        return instance;
    }

    constructor() {
        this.appInfoService = ServiceRegistry.getAppInfoService();
        this.rootCertService = ServiceRegistry.getCertificationService();
    }

    regist(router) {
        // 下载gitlab 文件
        // 导入远程文件步骤
        // 1、client调用这个接口获取远程文件
        // 2、client保存远程文件
        router.get('/utils/getGitlabFile', async (ctx, next) => {
            let userId = ctx.userId;
            let url = ctx.query.url;
            let gitlabToken = await this.appInfoService.getGitlabToken();
            let response = await gitlab.getContent(url, gitlabToken);
            this.body = {
                headers: response.headers,
                data: response.data
            };
        });

        // 下载证书
        router.get('/utils/rootCA.crt', async (ctx, next) => {
            let userId = ctx.userId;
            ctx.set('Content-disposition', 'attachment;filename=zproxy.crt');
            ctx.body = await this.rootCertService.getRootCACertPem(userId);
        });

        router.get('/pac', async (ctx) => {
            let ip = this.appInfoService.getPcIp();
            let port = this.appInfoService.getRealUiPort();
            var pac = "var youzanDomain = /^.*(yzcdn\.cn|youzan\.com|koudaitong\.com)$/;\n\
                        var direct = 'DIRECT;';\n\
                        var zProxy = 'PROXY ${ip}:${port}';\n\
                        var except = ['img.yzcdn.cn', 'uic.youzan.com'];\n\
                        function FindProxyForURL(url, host) {\n\
                            if (youzanDomain.test(host)) {\n\
                                if (except.indexOf(host) > -1 || url.indexOf('/img/') > -1 || url.indexOf('/image/') > -1) {\n\
                                    return direct;\n\
                                }\n\
                                return zProxy;\n\
                            }\n\
                            return direct;\n\
                       }";
            pac = pac.replace('${ip}', ip);
            pac = pac.replace('${port}', port);
            ctx.set('Content-Type', 'application/x-javascript-config');
            ctx.body = pac;
        });
    }
};