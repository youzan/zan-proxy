#!/usr/bin/env node

const fs = require("fs");
const jsonfile = require("jsonfile");
const path = require("path");
const os = require("os");
const proxyDataDir = path.join(os.homedir(), '.front-end-proxy');
/**
 * 初始化脚本
 * @param force
 */
function resetData(force = false) {

    createDir(proxyDataDir);
    createDir(path.join(proxyDataDir, "certificate"));
    createDir(path.join(proxyDataDir, "certificate/root"));
    createDir(path.join(proxyDataDir, "host"));
    createDir(path.join(proxyDataDir, "rule"));
    createDir(path.join(proxyDataDir, "breakpoint"));
    createDir(path.join(proxyDataDir, "mock-data"));
    createDir(path.join(proxyDataDir, "mock-list"));
    createDir(path.join(proxyDataDir, "profile"));
    createDir(path.join(proxyDataDir, "filter"));
    createDir(path.join(proxyDataDir, "traffic"));

    resetFile(path.join(proxyDataDir, "clientIpUserMap.json"), {}, force);
    resetFile(path.join(proxyDataDir, "configure.json"), {}, force);
    const rootTargetDir = path.join(proxyDataDir, "certificate/root");
    ["zproxy.crt.pem", "zproxy.key.pem"].forEach((f) => {
        fs
            .createReadStream(path.join(__dirname, "../certificate", f))
            .pipe(fs.createWriteStream(path.join(rootTargetDir, f)));
    });
}

function resetFile(filePath, data, force) {
    if (!force && fs.existsSync(filePath)) {
        return;
    }
    jsonfile.writeFileSync(filePath, data);
}

function createDir(dirPath) {
    const exists = fs.existsSync(dirPath);
    if (!exists) {
        fs.mkdirSync(dirPath);
    }
}

const oldDir = path.join(proxyDataDir, "../.zanmock-proxy");

function restoreFromOld() {
    if (!fs.existsSync(oldDir)) {
        return;
    }
    restoreHost();
    restoreRule();
    restoreProfile();
}

function restoreHost() {
    const oldHostDir = path.join(oldDir, "local/host");
    const syncFlag = path.join(oldHostDir, ".sync_already");
    if (fs.existsSync(syncFlag)) {
        return;
    }
    const newHostDir = path.join(proxyDataDir, "host");
    const oldHostFiles = fs
        .readdirSync(oldHostDir)
        .filter((f) => f.endsWith(".json"));
    oldHostFiles.forEach((fileName) => {
        const newFilePath = path.join(newHostDir, `root_${fileName}`);
        if (fs.existsSync(newFilePath)) {
            return;
        }
        const readStream = fs.createReadStream(path.join(oldHostDir, fileName));
        const writeStream = fs.createWriteStream(newFilePath);
        readStream.pipe(writeStream);
    });
    fs.writeFileSync(syncFlag, "true");
}

function restoreRule() {
    const oldRuleDir = path.join(oldDir, "local/rule");
    const syncFlag = path.join(oldRuleDir, ".sync_already");
    if (fs.existsSync(syncFlag)) {
        return syncFlag;
    }
    const newRuleDir = path.join(proxyDataDir, "rule");
    const oldRuleFiles = fs
        .readdirSync(oldRuleDir)
        .filter((f) => f.endsWith(".json"));
    oldRuleFiles.forEach((ruleFile) => {
        const newRuleFilePath = path.join(newRuleDir, `root_${ruleFile}`);
        if (fs.existsSync(newRuleFilePath)) {
            return;
        }
        const oldRuleFilePath = path.join(oldRuleDir, ruleFile);
        const fileContent = fs.readFileSync(oldRuleFilePath, {encoding: "utf-8"});
        const oldRuleFile = JSON.parse(fileContent);
        const newRuleFile = convertRuleFile(oldRuleFile);
        fs.writeFileSync(newRuleFilePath, JSON.stringify(newRuleFile), {encoding: "utf-8"});
    });
    fs.writeFileSync(syncFlag, "true");
}

function convertRuleFile(oldRuleFile) {
    const newRuleFile = Object.assign({}, oldRuleFile);
    newRuleFile.content = newRuleFile
        .content
        .filter((rule) => {
            return rule.action && rule.action.type === "redirect"; // 其他action暂时不支持
        })
        .map(convertRule);
    return newRuleFile;
}

function convertRule(oldRule) {
    const newRule = Object.assign({}, oldRule);
    newRule.actionList = [convertAction(oldRule.action)];
    return newRule;
}

function convertAction(oldAction) {
    const newAction = Object.assign({}, oldAction);
    newAction.data = Object.assign({}, {
        callbackName: "",
        cookieKey: "",
        cookieValue: "",
        dataId: "",
        headerKey: "",
        headerValue: "",
        modifyRequestScript: "",
        modifyResponseScript: "",
        modifyResponseType: "",
        target: "",
    }, oldAction.data);
    return newAction;
}

function restoreProfile() {
    const oldFile = path.join(oldDir, "local/conf.json");
    if (!fs.existsSync(oldFile)) {
        return;
    }
    const oldConf = JSON.parse(fs.readFileSync(oldFile, {encoding: "utf-8"}));
    const newConf = {
        enableFilter: false,
        enableHost: true,
        enableRule: true,
        projectPath: oldConf.responderParams || {},
    };
    const newFile = path.join(proxyDataDir, "profile/root.json");
    if (fs.existsSync(newFile)) {
        return;
    }
    fs.writeFileSync(newFile, JSON.stringify(newConf), {encoding: "utf-8"});
}
(() => {
    console.log("开始初始化数据...");
    resetData();
    restoreFromOld();
    console.log("初始化完成!");
})();
