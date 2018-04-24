#!/usr/bin/env node
const program = require('commander');
const packageInfo = require("./package.json");
const log = require('./src/core/utils/log');
const Launcher = require('./src/launcher');

program
    .version(packageInfo.version)
    .option('-p, --proxyPort [value]', '指定代理端口')
    .option('-u, --uiPort [value]', '指定UI端口')
    .option('-u, --userMode [value]', '用户模式')
    .option('-s, --serviceType [value]', '启动类型，默认desktop')
    .parse(process.argv);

// 启动开发代理服务器
let proxyPort = program.proxyPort;
let uiPort = program.uiPort;
let userMode = program.userMode;
let serviceType = program.serviceType;

let launcher = new Launcher(proxyPort, uiPort, serviceType, userMode);
launcher.start();

process.on("SIGINT", function () {
    process.exit();
});
process.on("uncaughtException", function (err) {
    log.error(err);
});
process.on('unhandledRejection', (reason, p) => {
    console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});