const getPort = require("get-port");
const ServiceRegistry = require("./core/service/index");
const HttpServer = require("./core/proxy/httpServer");
const HttpsServer = require("./core/proxy/httpsServer");
const WebUiServer = require("./core/uiServer");

// 基于文件的service导入
const FileAppInfoService = require("./impl/file/appInfoService");
const FileBreakpointService = require("./impl/file/breakpointService");
const FileCertificationService = require("./impl/file/certificationService");
const FileProfileService = require("./impl/file/profileService");
const FileConfigureService = require("./impl/file/configureService");
const FileFilterService = require("./impl/file/filterService");
const FileHostService = require("./impl/file/hostService");
const FileHttpTrafficService = require("./impl/file/httpTrafficService");
const FileLogService = require("./impl/file/logService");
const FileMockDataService = require("./impl/file/mockDataService");
const FileRuleService = require("./impl/file/ruleService");
const FilewsMockService = require("./impl/file/wsMockService");

module.exports = class Launcher {
    /**
     * @param port 代理端口号
     * @param serviceType 使用的服务类型
     * @param isSingle 是否是单用户模式
     */
    constructor(port = 8001, webUIPort = 40001, serviceType = "file", userMode = "single") {
        this.serviceType = serviceType;
        this.single = userMode != "multi";
        this.port = port;
        this.webUIPort = webUIPort;
    }

    /**
     * 启动代理
     * @param port
     */
    async start() {
        await this._initService();
        await this._startProxyServer();
        await this._startWebUiServer();
        // await this._startServiceMockServer();
    }

    // 初始化各种服务 并注册
    async _initService() {
        let appInfoService;
        let breakpointService;
        let certificationService;
        let profileService;
        let configureService;
        let filterService;
        let hostService;
        let httpTrafficService;
        let logService;
        let mockDataService;
        let ruleService;
        let wsMockService;
        if (this.serviceType == "db") {
            // 基于数据库的服务

        } else if (this.serviceType == "db-cluster") {
            // 基于数据库的服务 集群版

        } else {
            // 基于文件的服务

            // 基础服务
            logService = new FileLogService();
            appInfoService = new FileAppInfoService(this.single);

            configureService = new FileConfigureService({appInfoService});

            let baseService = {logService, appInfoService, configureService};

            // 复合服务
            breakpointService = new FileBreakpointService(baseService);
            certificationService = new FileCertificationService(baseService);

            profileService = new FileProfileService(baseService);
            filterService = new FileFilterService({profileService, ...baseService});
            hostService = new FileHostService({profileService, ...baseService});
            httpTrafficService = new FileHttpTrafficService(baseService);
            mockDataService = new FileMockDataService(baseService);
            ruleService = new FileRuleService({profileService, ...baseService});
            wsMockService = new FilewsMockService(baseService);

        }

        // 启动服务
        await appInfoService.start();
        await breakpointService.start();
        await certificationService.start();
        await configureService.start();
        await profileService.start();
        await filterService.start();
        await hostService.start();
        await httpTrafficService.start();
        await logService.start();
        await mockDataService.start();
        await ruleService.start();
        await wsMockService.start();

        // 注册服务
        ServiceRegistry.registeServices({
            appInfoService,
            breakpointService,
            certificationService,
            profileService,
            configureService,
            filterService,
            hostService,
            httpTrafficService,
            logService,
            mockDataService,
            ruleService,
            wsMockService,
        });
    }

    // 启动代理服务器(http 代理、https代理)
    async _startProxyServer() {
        this.appInfoService = ServiceRegistry.getAppInfoService();
        this.configureService = ServiceRegistry.getConfigureService();
        this.profileService = ServiceRegistry.getProfileService();

        // 如果不存在 则从配种中取默认值
        if (!this.port) {
            this.port = this.configureService.getProxyPort();
        }
        // 记录运行时的代理端口
        this.appInfoService.setHttpProxyPort(this.port);

        // 获取https代理端口，并记录
        let httpsPort = await getPort(40005);
        this.appInfoService.setHttpsProxyPort(httpsPort);

        // 启动http转发服务器
        await new HttpServer(this.port, httpsPort).start();

        // 启动https转发服务器
        await new HttpsServer(httpsPort).start();
    }

    // 启动管理界面服务器
    async _startWebUiServer() {
        let webUiPort = await getPort(this.webUIPort);

        // 设置运行时的用户界面端口
        this.appInfoService.setRealUiPort(webUiPort);

        // 启动web ui
        await new WebUiServer(webUiPort).start();

        this.appInfoService.printRuntimeInfo();
    }
}