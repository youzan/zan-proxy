/**
 * Created by tsxuehu on 4/11/17.
 */
const ServiceRegistry = require("../../service");
let instance;
module.exports = class ConfigController {
    static getInstance() {
        if (!instance) {
            instance = new ConfigController();
        }
        return instance;
    }
    constructor() {
        this.profileService = ServiceRegistry.getProfileService();

    }

    regist(router) {
        router.post('/profile/savefile', async (ctx, next) => {
            let userId = ctx.userId;
            await this.profileService.setProfile(userId, ctx.request.body);
            ctx.body = {
                code: 0
            };
        });

        router.post('/profile/setRuleState', async (ctx, next) => {
            let userId = ctx.userId;
            await this.profileService.setEnableRule(userId, !!ctx.query.rulestate);
            ctx.body = {
                code: 0
            };
        });

        router.post('/profile/setHostState', async (ctx, next) => {
            let userId = ctx.userId;
            await this.profileService.setEnableHost(userId, !!ctx.query.hoststate);
            ctx.body = {
                code: 0
            };
        });

        router.post('/profile/setFilterState', async (ctx, next) => {
            let userId = ctx.userId;
            await this.profileService.setEnableFilter(userId, !!ctx.query.filterstate);
            ctx.body = {
                code: 0
            };
        });

    }

}