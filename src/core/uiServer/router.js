const Router = require("koa-router");
const cookieParser = require("cookie");
let BreakpointController= require('./controller/breakpointController');
let ConfigController= require('./controller/configController');
let ProfileController= require('./controller/profileController');
let HostController= require('./controller/hostController');
let HttpTrafficController= require('./controller/httpTrafficController');
let FilterController= require('./controller/filterController');
let MockDataController= require('./controller/mockDataController');
let RuleController = require('./controller/ruleController');
let UtilsController = require('./controller/utilsController');

module.exports = function getRouter() {
    let router = new Router();
    // 注册中间件，获取用户身份
    router.use(async (ctx, next) => {
        // 取用户Id
        let cookies = cookieParser.parse(ctx.request.headers.cookie || "");
        ctx.userId = cookies['userId'] || 'root';
        await next();
    });
    BreakpointController.getInstance().regist(router);
    ConfigController.getInstance().regist(router);
    ProfileController.getInstance().regist(router);
    HostController.getInstance().regist(router);
    HttpTrafficController.getInstance().regist(router);
    FilterController.getInstance().regist(router);
    MockDataController.getInstance().regist(router);
    RuleController.getInstance().regist(router);
    UtilsController.getInstance().regist(router);
    return router.routes();
};