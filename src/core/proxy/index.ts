import compose from 'koa-compose';
import { Container, Inject, Service } from 'typedi';

import { IProxyMiddlewareFn } from '@core/types/proxy';

import {
  ForwarderMiddleware,
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
import { IProxyMiddleware } from '../types/proxy';
import HttpServer from './servers/http';
import HttpsServer from './servers/https';

const COMMON_MIDDLEWARE_CLASSES: IProxyMiddleware[] = [
  Container.get(IgnoreMiddleware),
  Container.get(IpMiddleware),
  Container.get(UserMiddleware),
  Container.get(RecordResponseMiddleware),
  Container.get(RuleMiddleware),
  Container.get(PluginMiddleware),
  Container.get(HostMiddleware),
  Container.get(RecordRequestMiddleware),
];

@Service()
export class Proxy {
  private middleware: IProxyMiddlewareFn[] = [];

  private handlers: {
    http: HttpHandler;
    connect: ConnectHandler;
    upgrade: UpgradeHandler;
  };

  @Inject() private forwarder: ForwarderMiddleware;
  @Inject() private httpProxyServer: HttpServer;
  @Inject() private httpsProxyServer: HttpsServer;

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
    this.handlers = {
      connect: Container.get(ConnectHandler),
      http: Container.get(HttpHandler),
      upgrade: Container.get(UpgradeHandler),
    };

    await this.httpsProxyServer.init();
    this.httpProxyServer.setHttpHandler(this.handlers.http);
    this.httpProxyServer.setConnectHandler(this.handlers.connect);
    this.httpProxyServer.setUpgradeHandler(this.handlers.upgrade);

    this.httpsProxyServer.setHttpHandler(this.handlers.http);
    this.httpsProxyServer.setUpgradeHandler(this.handlers.upgrade);

    COMMON_MIDDLEWARE_CLASSES.forEach(middleware => this.useMiddleware(middleware));
  }

  public listen(port: number = 8001) {
    const httpHandlerMiddleware = compose([
      ...this.middleware,
      this.forwarder.middleware.bind(this.forwarder),
    ]);
    this.handlers.http.setMiddleware(httpHandlerMiddleware);
    this.handlers.upgrade.setMiddleware(compose(this.middleware));
    this.httpProxyServer.listen(port);
    this.httpsProxyServer.listen();
  }
}
