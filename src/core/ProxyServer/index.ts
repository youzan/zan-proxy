import getPort from 'get-port';
import compose from 'koa-compose';
import LRUCache from 'lru-cache';
import os from 'os';
import path from 'path';

import { ForwarderMiddleware } from '@core/App/middleware';
import { CertificateService } from '@core/App/services';
import { CertificateStorage } from '@core/App/storage';
import { IProxyMiddlewareFn } from '@core/App/types/proxy';

import { ConnectHandler, HttpHandler, UpgradeHandler } from './impl';
import { HttpServer, HttpsServer } from './servers';

export class ProxyServer {
  public static async create() {
    const proxyServer = new ProxyServer();
    await proxyServer.init();
    return proxyServer;
  }

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

  public use(fn: IProxyMiddlewareFn) {
    if (typeof fn !== 'function') {
      throw new TypeError('middleware must be a function!');
    }
    this.middleware.push(fn);
    return this;
  }

  private async init() {
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
  }
}
