const _ = require("lodash");
const fileUtil = require("../../core/utils/file");
const path = require('path');
const EventEmitter = require("events");
const defaultRule =  {
    "name": "js",
    "key": "9a489eaa-ca4a-481d-b3fb-75b41dd33cc0",
    "method": "get",
    "match": "/v2/wsc/build/js/(.+)_.+.js$",
    "checked": true,
    "actionList": [ // 执行的动作列表
        {
            "type": "redirect", // 动作类型
            "data": {
                "target": "<%=wscproject%>/local/js/$1.js",
                "dataId": "",
                "modifyResponseBody": "",
                "modifyResponseHeader": "",
                "cookie": "",
                "callbackName": ""
            }
        }
    ]
};
const passRule = {
    "method": "",
    "match": "",
    "actionList": [{
        "type": "bypass",
    }]
};
// 
module.exports = class RuleService extends EventEmitter {
    constructor({profileService, appInfoService}) {
        super();
        this.profileService = profileService;
        // userId - > (filename -> rule)
        this.rules = {};
        // 缓存数据: 正在使用的规则 userId -> inUsingRuleList
        this.usingRuleCache = {};
        this.appInfoService = appInfoService;

        let proxyDataDir = this.appInfoService.getProxyDataDir();
        this.ruleSaveDir = path.join(proxyDataDir, "rule");
    }

    async start() {
        // 读取规则文件
        let contentMap = await fileUtil.getJsonFileContentInDir(this.ruleSaveDir);
        _.forEach(contentMap, (content, fileName) => {
            let ruleName = content.name;
            let userId = fileName.substr(0, this._getUserIdLength(fileName, ruleName));
            this.rules[userId] = this.rules[userId] || {};
            this.rules[userId][ruleName] = content;
        })
    }

    // 创建规则文件
    async createRuleFile(userId, name, description) {
        if (this.rules[userId] && this.rules[userId][name]) {
            return false;
        }
        let ruleFile = {
            "meta": {
                "remote": false,
                "url": "",
                "ETag": "",
                "remoteETag": ""
            },
            "checked": false,
            "name": name,
            "description": description,
            "content": []
        };
        this.rules[userId] = this.rules[userId] || {};
        this.rules[userId][name] = ruleFile;
        // 写文件
        let filePath = this._getRuleFilePath(userId, name);
        await fileUtil.writeJsonToFile(filePath, ruleFile);
        // 发送消息通知
        this.emit('data-change', userId, this.getRuleFileList(userId));
        return true;
    }

    // 返回用户的规则文件列表
    getRuleFileList(userId) {
        let ruleMap = this.rules[userId] = this.rules[userId] || {};

        let rulesLocal = [];
        let rulesRemote = [];
        _.forEach(ruleMap, function (content) {
            if (content.meta.remote) {
                rulesRemote.push({
                    name: content.name,
                    checked: content.checked,
                    description: content.description,
                    meta: content.meta
                });
            } else {
                rulesLocal.push({
                    name: content.name,
                    checked: content.checked,
                    description: content.description,
                    meta: content.meta
                });
            }
        });

        return rulesLocal.concat(rulesRemote);
    }

    // 删除规则文件
    deleteRuleFile(userId, name) {
        let rule = this.rules[userId][name];

        delete this.rules[userId][name];

        let path = this._getRuleFilePath(userId, name);
        fileUtil.deleteFile(path);
        // 发送消息通知
        this.emit('data-change', userId, this.getRuleFileList(userId));
        if (rule.checked) {
            // 清空缓存
            delete this.usingRuleCache[userId];
        }
    }

    // 设置规则文件的使用状态
   async setRuleFileCheckStatus(userId, name, checked) {
        this.rules[userId][name].checked = checked;
        let path = this._getRuleFilePath(userId, name);
        await fileUtil.writeJsonToFile(path, this.rules[userId][name]);
        // 发送消息通知
        this.emit('data-change', userId, this.getRuleFileList(userId));
        delete this.usingRuleCache[userId];
    }

    // 获取规则文件的内容
    getRuleFile(userId, name) {
        return this.rules[userId][name];
    }

    // 保存规则文件(可能是远程、或者本地)
    saveRuleFile(userId, name, content) {
        let userRuleMap = this.rules[userId] || {};
        userRuleMap[name].content = content;
        this.rules[userId] = userRuleMap;
        // 写文件
        let filePath = this._getRuleFilePath(userId, name);
        fileUtil.writeJsonToFile(filePath, userRuleMap[name]);
        // 清空缓存
        delete this.usingRuleCache[userId];
    }

    /**
     * 根据请求,获取处理请求的规则
     * @param method
     * @param urlObj
     */
    getProcessRuleList(userId, method, urlObj) {
        let candidateRule = null;
        if (this.profileService.enableRule(userId)) {
            // 规则匹配部分
            let inusingRules = this._getInuseRules(userId);
            for (let i = 0; i < inusingRules.length; i++) {
                let rule = inusingRules[i];
                // 捕获规则
                if (this._isUrlMatch(urlObj.href, rule.match)
                    && this._isMethodMatch(method, rule.method)) {
                    candidateRule = rule;
                    break
                }
            }
        }
        // 查找规则，如果找不到则返回透传规则
        if (!candidateRule) {
            candidateRule = passRule
        }
        return candidateRule;
    }

    _getInuseRules(userId) {
        if (this.usingRuleCache[userId]) {
            return this.usingRuleCache[userId];
        }
        let ruleMap = this.rules[userId] || {};
        // 计算使用中的规则
        let rulesLocal = [];
        let rulesRemote = [];
        _.forEach(ruleMap, function (file, filename) {
            if (!file.checked) return;
            _.forEach(file.content, function (rule) {
                if (!rule.checked) return;
                let copy = _.cloneDeep(rule);
                copy.ruleFileName = filename;
                if (file.meta.remote) {
                    rulesRemote.push(copy);
                } else {
                    rulesLocal.push(copy);
                }
            });
        });
        let merged = rulesLocal.concat(rulesRemote);
        this.usingRuleCache[userId] = merged;
        return merged;
    }

    _getRuleFilePath(userId, ruleName) {
        let fileName = `${userId}_${ruleName}.json`;
        let filePath = path.join(this.ruleSaveDir, fileName);
        return filePath;
    }

    _getUserIdLength(ruleFileName, ruleName) {
        return ruleFileName.length - ruleName.length - 6;
    }

    // 请求的方法是否匹配规则
    _isMethodMatch(reqMethod, ruleMethod) {
        let loweredReqMethod = _.lowerCase(reqMethod);
        let loweredRuleMethod = _.lowerCase(ruleMethod);
        return loweredReqMethod == loweredRuleMethod
            || !ruleMethod
            || loweredReqMethod == 'option';
    }

    // 请求的url是否匹配规则
    _isUrlMatch(reqUrl, ruleMatchStr) {
        return ruleMatchStr && (reqUrl.indexOf(ruleMatchStr) >= 0
            || (new RegExp(ruleMatchStr)).test(reqUrl));
    }
}