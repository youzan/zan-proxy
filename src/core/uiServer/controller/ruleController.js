/**
 * Created by tsxuehu on 4/11/17.
 */
const ServiceRegistry = require("../../service");

let instance;
module.exports = class RuleController {
    static getInstance() {
        if (!instance) {
            instance = new RuleController();
        }
        return instance;
    }

    constructor() {
        this.ruleService = ServiceRegistry.getRuleService();
        this.configService = ServiceRegistry.getProfileService();
    }

    regist(router) {
        // 创建规则
        //{
        //    name:name,
        //    description:description
        //}
        router.post('/rule/create', async (ctx, next) => {
            let userId = ctx.userId;
            let result = await this.ruleService.createRuleFile(userId, ctx.request.body.name
                , ctx.request.body.description);
            ctx.body = {
                code: result ? 0 : 1,
                msg: result ? '' : '文件已存在'
            };
        });
        // 获取规则文件列表
        // /rule/filelist
        router.get('/rule/filelist', async (ctx, next) => {
            let userId = ctx.userId;
            let ruleFileList = await this.ruleService.getRuleFileList(userId);
            ctx.body = {
                code: 0,
                list: ruleFileList
            };
        });
        // 删除规则文件
        // /rule/deletefile?name=${name}
        router.get('/rule/deletefile', (ctx, next) => {
            let userId = ctx.userId;
            this.ruleService.deleteRuleFile(userId, ctx.query.name);
            ctx.body = {
                code: 0
            };
        });
        // 设置文件勾选状态
        // /rule/setfilecheckstatus?name=${name}&checked=${checked?1:0}
        router.get('/rule/setfilecheckstatus', (ctx, next) => {
            let userId = ctx.userId;
            this.ruleService.setRuleFileCheckStatus(userId, ctx.query.name,
                ctx.query.checked == 1 ? true : false);
            ctx.body = {
                code: 0
            };
        });
        // 获取规则文件
        // /rule/getfile?name=${name}
        router.get('/rule/getfile', async (ctx, next) => {
            let userId = ctx.userId;
            let content = await this.ruleService.getRuleFile(userId, ctx.query.name);
            ctx.body = {
                code: 0,
                data: content
            };
        });
        // 保存规则文件
        // /rule/savefile?name=${name} ,content
        router.post('/rule/savefile', async (ctx, next) => {
            let userId = ctx.userId;
            await this.ruleService.saveRuleFile(userId, ctx.query.name, ctx.request.body.content);
            ctx.body = {
                code: 0
            };
        });

        // 导入gitlab仓库中的文件
        router.post('/rule/importrepository', async (ctx, next) => {
            let userId = ctx.userId;
            let { gitlabUrl, token = '' } = ctx.request.body;
            // 下载gitlab中的文件
            await this.ruleService.saveRuleFile(userId, ctx.query.name, ctx.request.body.content);
            ctx.body = {
                code: 0
            };
        });

        // 导出规则文件
        // /rule/download?name=${name}
        router.get('/rule/download', async (ctx, next) => {
            let userId = ctx.userId;
            let name = ctx.query.name;
            let content = await this.ruleService.getRuleFile(userId, name);
            ctx.set('Content-disposition', `attachment;filename=${name}.json`);
            ctx.body = content;
        });
        // 测试规则
        // /rule/test
        router.post('/rule/test', async (ctx, next) => {
            /*
             url: '',// 请求url
             match: '',// url匹配规则
             targetTpl: '',// 路径模板， 会用urlReg的匹配结果来替换targetTpl $1 $2
             matchRlt: '',// url匹配结果
             targetRlt: ''// 路径匹配结果
             */
            let userId = ctx.userId;
            let match = ctx.request.body.match;
            let url = ctx.request.body.url;
            let matchRlt = '不匹配';

            if (match && (url.indexOf(match) >= 0 || (new RegExp(match)).test(url))) {
                matchRlt = 'url匹配通过';
            }

            let targetTpl = ctx.request.body.targetTpl;
            let targetRlt = await this.configService.calcPathbyUser(userId, url, match, targetTpl);

            // 测试规则
            ctx.body = {
                code: 0,
                data: {
                    matchRlt: matchRlt,
                    targetRlt: targetRlt
                }
            };
        });
    }
};