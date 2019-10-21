import compose from 'koa-compose';
import { Container, Inject, Service } from 'typedi';

import { IProxyMiddlewareFn } from '@core/types/proxy';

import {
  ForwarderMiddleware,
  HostMiddleware,
  IgnoreMiddleware,
  PluginMiddleware,
  RecordRequestMiddleware,
  RecordResponseMiddleware,
  RuleMiddleware,
} from './middleware';
import HttpServer from './servers/http';
import HttpsServer from './servers/https';

import { ConnectHandler, RequestHandler, UpgradeHandler } from '../proxy/handler';
import { IProxyMiddleware } from '../types/proxy';

const COMMON_MIDDLEWARE_CLASSES: IProxyMiddleware[] = [
  Container.get(IgnoreMiddleware),
  Container.get(RecordResponseMiddleware),
  Container.get(RuleMiddleware),
  Container.get(PluginMiddleware),
  Container.get(HostMiddleware),
  Container.get(RecordRequestMiddleware),
];

const forwardMiddleware = Container.get(ForwarderMiddleware);

@Service()
export class Proxy {
  private middleware: IProxyMiddlewareFn[] = [];

  private handlers: {
    request: RequestHandler;
    connect: ConnectHandler;
    upgrade: UpgradeHandler;
  } = {
    connect: Container.get(ConnectHandler),
    request: Container.get(RequestHandler),
    upgrade: Container.get(UpgradeHandler),
  };

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
    this.httpProxyServer.setHttpHandler(this.handlers.request);
    this.httpProxyServer.setConnectHandler(this.handlers.connect);
    this.httpProxyServer.setUpgradeHandler(this.handlers.upgrade);
    await this.httpsProxyServer.init();

    this.httpsProxyServer.setHttpHandler(this.handlers.request);
    this.httpsProxyServer.setUpgradeHandler(this.handlers.upgrade);

    COMMON_MIDDLEWARE_CLASSES.forEach(middleware => this.useMiddleware(middleware));
  }

  public listen(port: number = 8001) {
    this.handlers.request.setMiddleware(
      compose([...this.middleware, forwardMiddleware.middleware.bind(forwardMiddleware)]),
    );
    this.handlers.upgrade.setMiddleware(compose(this.middleware));
    this.httpProxyServer.listen(port);
    this.httpsProxyServer.listen();
  }
}
