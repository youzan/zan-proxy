#!/usr/bin/env node

import PluginManager from '@youzan/proxy-plugin-manager';
import { ProxyServer } from './../ProxyServer/index';
import IPMiddleware from '../middlware/ip';
import UserMiddleware from '../middlware/user';
import HostMiddleware from '../middlware/host'
import RuleMiddleware from '../middlware/rule';
import { endPoint, actualRequest } from './../middlware/monitor';

import ServiceRegistry from "../src_old/core/service";
import Launcher from '../src_old/launcher';

export default async (httpPort?, uiPort?) => {
    const pluginManager = new PluginManager();
    const launcher = new Launcher(httpPort, uiPort);
    await launcher.start(pluginManager);
    const server = new ProxyServer();
    server.use(IPMiddleware());
    server.use(UserMiddleware(ServiceRegistry.getProfileService()));
    server.use(endPoint(ServiceRegistry.getHttpTrafficService()));
    server.use(RuleMiddleware({
        ruleService: ServiceRegistry.getRuleService(),
        mockDataService: ServiceRegistry.getMockDataService(),
        profileService: ServiceRegistry.getProfileService(),
    }))
    server.use(HostMiddleware(ServiceRegistry.getHostService()));
    server.use(actualRequest(ServiceRegistry.getHttpTrafficService()));
    pluginManager.loadProxyMiddleware(server);
    server.start(httpPort);
}


process.on('unhandledRejection', (reason, p) => {
    console.error("Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

process.on("SIGINT", function () {
    process.exit();
});
process.on("uncaughtException", function (err) {
    console.error(err);
});
