const EventEmitter = require("events");
const _ = require("lodash");
const fileUtil = require("../../core/utils/file");
const path = require('path');

const defaultConfigure = {
    "gitlabToken": "",
    "proxyPort": 8001,
    "requestTimeoutTime": 30000
};
/**
 * 代理运转需要的规则数据
 * 代理端口、超时时间、gitlab token、工程路径、是否启用转发规则
 * Created by tsxuehu on 8/3/17.
 */
module.exports = class ConfigureService extends EventEmitter {
    constructor({appInfoService}) {
        super();
        this.appInfoService = appInfoService;
        let proxyDataDir = this.appInfoService.getProxyDataDir();
        this.configureFile = path.join(proxyDataDir, "configure.json");
        this.configure = {};
    }

    async start() {
        let customConfigure = await fileUtil.readJsonFromFile(this.configureFile);
        this.configure = _.assign({}, defaultConfigure, customConfigure);
    }

    // 获取配置
    getConfigure() {
        return this.configure;
    }

    // 设置配置，保存到文件
    async setConfigure(userId, configure) {
        this.configure = configure;
        await fileUtil.writeJsonToFile(this.configureFile, this.configure);
        // 发送通知
        this.emit('data-change',userId, this.configure);
    }

    // 获取代理端口
    getProxyPort() {
        return this.configure.proxyPort;
    }
}