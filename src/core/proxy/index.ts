import getPort from 'get-port';
import compose from 'koa-compose';
import LRUCache from 'lru-cache';
import os from 'os';
import path from 'path';
import { Container, Service } from 'typedi';

import { ForwarderMiddleware } from '@core/middleware';
import { CertificateService } from '@core/services';
import { CertificateStorage } from '@core/storage';
import { IProxyMiddlewareFn } from '@core/types/proxy';

import {
  HostMiddleware,
  IgnoreMiddleware,
  IpMiddleware,
  PluginMiddleware,
  RecordRequestMiddleware,
  RecordResponseMiddleware,
  RuleMiddleware,
  UserMiddleware,
} from '../middleware';
import { ConnectHandler, HttpHandler, UpgradeHandler } from '../proxy/handler';
import { HttpServer, HttpsServer } from '../proxy/servers';
import { IProxyMiddleware } from '../types/proxy';

@Service()
export class Proxy {
  private middleware: IProxyMiddlewareFn[] = [];
  private cache: LRUCache<string, any>;
  private forwarder: ForwarderMiddleware;
  private cert: {
    service: CertificateService;
    storage: CertificateStorage;
  };
  private handlers: {
    http: HttpHandler;
    connect: ConnectHandler;
    upgrade: UpgradeHandler;
  };

  private httpProxyServer: HttpServer;
  private httpsProxyServer: HttpsServer;

  private httpsPort: number;

  private builtInMiddleware: IProxyMiddleware[] = [
    Container.get(IgnoreMiddleware),
    Container.get(IpMiddleware),
    Container.get(UserMiddleware),
    Container.get(RecordResponseMiddleware),
    Container.get(RuleMiddleware),
    Container.get(PluginMiddleware),
    Container.get(HostMiddleware),
    Container.get(RecordRequestMiddleware),
  ];

  public ignore(pattern: string) {
    Container.get(IgnoreMiddleware).addPattern(pattern);
  }

  private useMiddleware(middlewareCls: IProxyMiddleware) {
    // 中间件 class 初始化
    if (middlewareCls.onInit) {
      middlewareCls.onInit();
    }
    // 中间件 class 挂载
    this.middleware.push(middlewareCls.middleware.bind(middlewareCls));
  }

  public async init() {
    this.forwarder = new ForwarderMiddleware();
    this.cache = new LRUCache({
      max: 500,
      maxAge: 1000 * 60 * 60,
    });
    const certStorage = new CertificateStorage(
      path.join(os.homedir(), '.front-end-proxy/certificate'),
    );
    const certService = new CertificateService(certStorage, this.cache);
    this.cert = {
      service: certService,
      storage: certStorage,
    };
    this.httpsPort = await getPort({ port: 8989 });

    this.handlers = {
      connect: new ConnectHandler(this.httpsPort, this.cache),
      http: new HttpHandler(),
      upgrade: new UpgradeHandler(),
    };

    this.httpProxyServer = new HttpServer();
    this.httpsProxyServer = await HttpsServer.create(this.cert.service);
    this.httpProxyServer.setHttpHandler(this.handlers.http);
    this.httpProxyServer.setConnectHandler(this.handlers.connect);
    this.httpProxyServer.setUpgradeHandler(this.handlers.upgrade);

    this.httpsProxyServer.setHttpHandler(this.handlers.http);
    this.httpsProxyServer.setUpgradeHandler(this.handlers.upgrade);

    this.builtInMiddleware.forEach(middleware => this.useMiddleware(middleware));
  }

  public listen(port: number = 8001) {
    const httpHandlerMiddleware = compose([
      ...this.middleware,
      this.forwarder.middleware.bind(this.forwarder),
    ]);
    this.handlers.connect.httpPort = port;
    this.handlers.http.setMiddleware(httpHandlerMiddleware);
    this.handlers.upgrade.setMiddleware(compose(this.middleware));
    this.httpProxyServer.listen(port);
    this.httpsProxyServer.listen(this.httpsPort);
  }
}
