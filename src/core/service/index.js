/**
 * 服务注册
 * 应用启动的时候首先创建服务，然后注册到ServiceRegistry
 * 业务处理时需要使用服务时从ServiceRegistry取服务
 * @type {ServiceRegistry}
 */
let registry ;
module.exports = class ServiceRegistry {
    static registeServices(services) {
        registry = services;
    }

    static getBreakpointService() {
        return registry.breakpointService;
    }

    static getProfileService() {
        return registry.profileService;
    }

    static getConfigureService() {
        return registry.configureService;
    }

    static getHostService() {
        return registry.hostService;
    }

    static getHttpTrafficService() {
        return registry.httpTrafficService;
    }

    static getMockDataService() {
        return registry.mockDataService;
    }

    static getRuleService() {
        return registry.ruleService;
    }

    static getFilterService() {
        return registry.filterService;
    }

    static getWsMockService() {
        return registry.wsMockService;
    }

    static getLogService() {
        return registry.logService;
    }

    static getCertificationService() {
        return registry.certificationService;
    }

    static getAppInfoService() {
        return registry.appInfoService;
    }
}