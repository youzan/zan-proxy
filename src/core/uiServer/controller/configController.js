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
        this.confService = ServiceRegistry.getConfigureService();

    }

    regist(router) {
        router.post('/configure/savefile', async (ctx, next) => {
            let userId = ctx.userId;
            await this.confService.setConfigure(userId,ctx.request.body);
            ctx.body = {
                code: 0
            };
        });
    }

}