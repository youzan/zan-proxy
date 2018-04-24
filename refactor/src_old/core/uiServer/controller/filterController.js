/**
 * Created by tsxuehu on 4/11/17.
 */
const ServiceRegistry = require("../../service");
let instance;
module.exports = class FilterController {
    static getInstance() {
        if (!instance) {
            instance = new FilterController();
        }
        return instance;
    }
    constructor() {
        this.filterService = ServiceRegistry.getFilterService();

    }

    regist(router) {
        router.post('/filter/savefilters', async (ctx, next) => {
            let userId = ctx.userId;
            await this.filterService.save(userId, ctx.request.body);
            ctx.body = {
                code: 0
            };
        });
    }

}