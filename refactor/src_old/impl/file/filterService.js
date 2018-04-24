const EventEmitter = require("events");
const _ = require("lodash");
const fileUtil = require("../../core/utils/file");
const path = require('path');

module.exports = class FilterService extends EventEmitter {
    constructor({profileService, appInfoService}) {
        super();
        // user -> filters 映射
        this.filters = {};
        let proxyDataDir = appInfoService.getProxyDataDir();
        this.breakpointSaveDir = path.join(proxyDataDir, "filter");

        this.profileService = profileService;
    }

    async start() {
        let filterMap = await fileUtil.getJsonFileContentInDir(this.breakpointSaveDir);
        _.forEach(filterMap, (filters, fileName) => {
            let userId = fileName.slice(0,-5);
            this.filters[userId] = filters;
        });
    }

    async getMatchedRuleList(userId, method, urlObj) {
        if (!this.profileService.enableFilter(userId)) {
            return [];
        }
        let ruleLists = await this.getFilterRuleList(userId);
        return _.filter(ruleLists, rule => {
            return rule.checked && this._isMethodMatch(method, rule.method)
                && this._isUrlMatch(urlObj.href, rule.match)
        })
    }

    async getFilterRuleList(userId) {
        return this.filters[userId] || [];
    }

    async save(userId, filters) {
        this.filters[userId] = filters;
        let filePath = path.join(this.breakpointSaveDir,`${userId}.json`);
        // 将数据写入文件
        await fileUtil.writeJsonToFile(filePath, filters);
        this.emit("data-change", userId, filters);
    }

    // 请求的方法是否匹配规则
    _isMethodMatch(reqMethod, ruleMethod) {
        let loweredReqMethod = _.lowerCase(reqMethod);
        let loweredRuleMethod = _.lowerCase(ruleMethod);
        return !ruleMethod
            || loweredReqMethod == loweredRuleMethod
            || loweredReqMethod == 'option';
    }

    // 请求的url是否匹配规则
    _isUrlMatch(reqUrl, ruleMatchStr) {
        return !ruleMatchStr || reqUrl.indexOf(ruleMatchStr) >= 0
            || (new RegExp(ruleMatchStr)).test(reqUrl);
    }
}