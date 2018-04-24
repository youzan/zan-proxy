const EventEmitter = require("events");
const _ = require("lodash");
const fileUtil = require("../../core/utils/file");
const path = require('path');

const defaultProfile = {
    // 工程路径配置
    "projectPath": {},
    // 是否启用转发规则
    "enableRule": true,
    // 是否启用host解析
    "enableHost": true,
    // 是否启用filter
    "enableFilter": true
};
/**
 * 代理运转需要的规则数据
 * 代理端口、超时时间、gitlab token、工程路径、是否启用转发规则
 * Created by tsxuehu on 8/3/17.
 */
module.exports = class ProfileService extends EventEmitter {
    constructor({ appInfoService }) {
        super();
        // userId -> profile
        this.userProfileMap = {};
        // clientIp -> userId
        this.clientIpUserMap = {};
        this.appInfoService = appInfoService;
        let proxyDataDir = this.appInfoService.getProxyDataDir();
        this.profileSaveDir = path.join(proxyDataDir, "profile");
        this.clientIpUserMapSaveFile = path.join(proxyDataDir, "clientIpUserMap.json");
    }

    async start() {
        let profileMap = await fileUtil.getJsonFileContentInDir(this.profileSaveDir);
        _.forEach(profileMap, (profile, fileName) => {
            let userId = fileName.slice(0, -5);
            // 补全profile数据
            // this.userProfileMap[userId] = _.assign({}, defaultProfile, profile);;
            this.userProfileMap[userId] = profile;

        });
        // 加载ip-> userID映射
        this.clientIpUserMap = await fileUtil.readJsonFromFile(this.clientIpUserMapSaveFile);
    }

    getProfile(userId) {
        return this.userProfileMap[userId] || defaultProfile;
    }

    async setProfile(userId, profile) {
        this.userProfileMap[userId] = profile;

        let filePath = path.join(this.profileSaveDir, `${userId}.json`);
        // 将数据写入文件
        await fileUtil.writeJsonToFile(filePath, profile);
        // 发送通知
        this.emit('data-change-profile', userId, profile);
    }

    /**
     * 替换redirect中的变量引用,
     * 如果引用的变量不存在，则不做替换
     * @param clientIp
     * @param href
     * @param match
     * @param target
     */
    calcPath(userId, href, match, target) {
        if (match) {
            let matchList = href.match(new RegExp(match));
            _.forEach(matchList, function (value, index) {
                if (index == 0) return;
                var reg = new RegExp('\\$' + index, 'g');
                if (value === undefined) value = '';
                target = target.replace(reg, value);
            });
            let compiled = _.template(target);
            let projectPath = this.getProfile(userId).projectPath;
            // 解析应用的变量
            return compiled(projectPath);
        }
    }

    /**
     *
     * @param userId
     * @param enable
     */
    async setEnableRule(userId, enable) {
        let conf = this.getProfile(userId);
        conf.enableRule = enable;
        await this.setProfile(userId, conf);
    }

    async setEnableHost(userId, enable) {
        let conf = this.getProfile(userId);
        conf.enableHost = enable;
        await this.setProfile(userId, conf);
    }

    async setEnableFilter(userId, enable) {
        let conf = this.getProfile(userId);
        conf.enableFilter = enable;
        await this.setProfile(userId, conf);
    }


    /**
     * 获取转发规则启用开关
     * @param clientIp
     */
    enableRule(userId) {
        return this.getProfile(userId).enableRule;
    }

    enableHost(userId) {
        return this.getProfile(userId).enableHost;
    }

    enableFilter(userId) {
        return this.getProfile(userId).enableFilter;
    }

    // 获取clientIp对应的user id
    getClientIpMappedUserId(clientIp) {
        return this.clientIpUserMap[clientIp] || 'root';
    }

    // 将ip绑定至用户
    async bindClientIp(userId, clientIp) {
        let originUserId = this.clientIpUserMap[clientIp];
        this.clientIpUserMap[clientIp] = userId;

        await fileUtil.writeJsonToFile(this.clientIpUserMapSaveFile, this.clientIpUserMap);

        let clientIpList = this.getClientIpsMappedToUserId(userId);
        this.emit('data-change-clientIpUserMap', userId, clientIpList);

        if (originUserId) {
            let originClientIpList = this.getClientIpsMappedToUserId(originUserId);
            this.emit('data-change-clientIpUserMap', originUserId, originClientIpList);
        }
    }

    // 获取用户绑定的clientip
    getClientIpsMappedToUserId(userId) {
        let ips = [];
        _.forEach(this.clientIpUserMap, (mapedUserId, ip) => {
            if (mapedUserId == userId) {
                ips.push(ip);
            }
        });
        return ips;
    }
};