/**
 * Created by tsxuehu on 4/11/17.
 */
const { Container } = require('typedi')
const { ProfileConfigServiceToken } = require('lib-zan-proxy/lib/service')

let instance;
module.exports = class ConfigController {
    static getInstance() {
        if (!instance) {
            instance = new ConfigController();
        }
        return instance;
    }
    constructor() {
        this.profileService = Container.get(ProfileConfigServiceToken)

    }

    regist(router) {
        router.post('/profile/savefile', async (ctx, next) => {
            await this.profileService.setProfile(ctx.request.body);
            ctx.body = {
                code: 0
            };
        });

        router.post('/profile/setRuleState', async (ctx, next) => {
            await this.profileService.setEnableRule(!!ctx.query.rulestate);
            ctx.body = {
                code: 0
            };
        });

        router.post('/profile/setHostState', async (ctx, next) => {
            await this.profileService.setEnableHost(!!ctx.query.hoststate);
            ctx.body = {
                code: 0
            };
        });

        router.post('/profile/setFilterState', async (ctx, next) => {
            await this.profileService.setEnableFilter(!!ctx.query.filterstate);
            ctx.body = {
                code: 0
            };
        });

    }

}