// TODO: UPGRADE HANDLER

import LRU from 'lru-cache';
import path from 'path';
import http from 'http';
import compose from 'koa-compose';
import Stream from 'stream';
import getPort from 'get-port';
import ConnectHandler from '../handler/connect';

import HttpsServer from './https';
import Certificate from '../service/Certificate';
import CertificateStorage from '../service/storage/Certificate';

import Forwarder from '../forwarder';

import WSHandle from '../src_old/core/proxy/handle/wsHandle'

export class ProxyServer {
  httpProxyServer: http.Server;
  port: number;

  httpsProxyServer: HttpsServer;

  connectHandler: ConnectHandler;

  middleware: Array < any > = [];

  forwarder: Forwarder;

  async start(port: number = 8001) {
    this.port = port
    this.httpProxyServer = http.createServer();
    const handler = this.makeHandler();
    this.forwarder = new Forwarder();
    const certStorage = new CertificateStorage(path.join(process.env.HOME || process.env.USERPROFILE || '~/', '.front-end-proxy/certificate'));
    const cache = LRU({
      maxAge: 1000 * 60 * 60,
      max: 500,
    });
    const httpsPort = await getPort({port: 8989})
    const upgradeHandler = WSHandle.getInstance();
    this.connectHandler = new ConnectHandler(httpsPort, cache);
    this.httpProxyServer.on('request', handler);
    this.httpProxyServer.on('connect', this.connectHandler.handle.bind(this.connectHandler));
    this.httpProxyServer.on('upgrade', upgradeHandler.handle.bind(upgradeHandler))
    this.httpProxyServer.listen(port, '0.0.0.0')
    const cert = new Certificate(certStorage, cache);
    this.httpsProxyServer = new HttpsServer(cert, this.connectHandler, upgradeHandler, handler);
    this.httpsProxyServer.listen();
  }

  use(fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
    this.middleware.push(fn);
    return this;
  }

  makeHandler() {
    const middleware = compose(this.middleware.concat([async (ctx) => {
      await this.forwarder.forward(ctx);
    }]));
    return async (req, res) => {
      const context: any = {
        req,
        res,
      };
      middleware(context).then(() => {
        if (!res.writable || res.finished) {
          return Promise.resolve(false);
        }
        const {
          body
        } = res;
        if (Buffer.isBuffer(body)) return res.end(body);
        if ('string' == typeof body) return res.end(body);
        if (body instanceof Stream) return body.pipe(res);
        return res.end(JSON.stringify(body));
      })

    }
  }
}