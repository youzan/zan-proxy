#!/usr/bin/env node

import 'reflect-metadata'
import { Container } from 'typedi'
import { ProxyServer } from 'lib-zan-proxy/lib/ProxyServer'
import { 
  IPMiddleware,
  hostMiddleware,
  ruleMiddleware
} from 'lib-zan-proxy/lib/middlware'
import {
  RootStorageToken,
  ProxyConfig,
  RuntimeService as IRuntimeService,
  HostServiceToken,
  HostStorageToken,
  CertStorageToken,
  RuleServiceToken,
  MockServiceToken,
  ProfileConfigServiceToken,
  RuleStorageToken,
  ProfileConfigStorageToken,
  MockStorageToken
} from 'lib-zan-proxy/lib/service'
import { registerCleanup } from 'lib-zan-proxy/lib/utils'
import 'lib-zan-proxy/lib/impl'
import { RuntimeService, ScopedKVService } from 'lib-zan-proxy/lib/impl'

import { createLocalKVService, LocalKVService } from './localkv'
import { UIServer } from './server';
// import ManagerServer from '../manager/server'

const start = async () => {
  const config: ProxyConfig = {
    httpProxyPort: 8001,
    maxCertCache: 100,
    managerPort: 40001,
  }

  const runtime = await RuntimeService.New(config)
  Container.set(IRuntimeService, runtime)
  
  const rootStorage = await initStorage()
  await initServices()
  const server = Container.get(ProxyServer)
  server.use(IPMiddleware())
        // .use(UserMidleware())
  // server.use(endPoint(ServiceRegistry.getHttpTrafficService()));
  server.use(ruleMiddleware({
      ruleService: Container.get(RuleServiceToken),
      mockService: Container.get(MockServiceToken),
      profileConfigService: Container.get(ProfileConfigServiceToken),
  }))
  server.use(hostMiddleware(Container.get(HostServiceToken), Container.get(ProfileConfigServiceToken)))
  // server.use(actualRequest(ServiceRegistry.getHttpTrafficService()));

  process.stdin.resume() // https://stackoverflow.com/questions/14031763/doing-a-cleanup-action-just-before-node-js-exits
  registerCleanup(() => rootStorage.close())
  server.start(runtime)
  const uiServer = Container.get(UIServer)
  uiServer.listen(config.managerPort)
  // const managerServer = new ManagerServer()
  // managerServer.listen(config.managerPort)
}

start()

// process.on('unhandledRejection', (reason, p) => {
//   console.error('Unhandled Rejection at: Promise ', p, ' reason: ', reason)
// })
const initStorage = async () => {
  const kvService: LocalKVService = await createLocalKVService()
  Container.set(RootStorageToken, kvService)
  Container.set(CertStorageToken, new ScopedKVService(kvService, 'cert'))
  Container.set(HostStorageToken, new ScopedKVService(kvService, 'host'))
  Container.set(RuleStorageToken, new ScopedKVService(kvService, 'rule'))
  Container.set(MockStorageToken, new ScopedKVService(kvService, 'mock'))
  Container.set(ProfileConfigStorageToken, new ScopedKVService(kvService, 'profileConfig'))
  return kvService
}

const initServices = async () => {
  await Container.get(RuleServiceToken).init()
  await Container.get(MockServiceToken).init()
  await Container.get(ProfileConfigServiceToken).init()
  await Container.get(HostServiceToken).init()
  await Container.get(RuleServiceToken).init()
  await Container.get(MockServiceToken).init()
  await Container.get(ProfileConfigServiceToken).init()
  
}