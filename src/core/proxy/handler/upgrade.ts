import http from 'http';
import HttpProxy from 'http-proxy';
import { ComposedMiddleware } from 'koa-compose';
import net from 'net';
import { Service } from 'typedi';
import URL from 'url';

import { IProxyContext } from '@core/types/proxy';

@Service()
export class UpgradeHandler {
  private proxyServer: HttpProxy = HttpProxy.createProxyServer({
    secure: false, // http-proxy api  在request的option里设置 rejectUnauthorized = false
  });

  private middleware: ComposedMiddleware<IProxyContext> = () => Promise.resolve();

  public setMiddleware(middleware: ComposedMiddleware<IProxyContext>) {
    this.middleware = middleware;
  }

  private websocketProxy(req: http.IncomingMessage, socket: net.Socket, head: Buffer) {
    const { hostname, port, protocol } = URL.parse(req.url as string);
    this.proxyServer.ws(req, socket, head, {
      target: {
        hostname,
        port,
        protocol,
      },
    });
  }

  public async handle(req: http.IncomingMessage, socket: net.Socket, head: Buffer) {
    const ctx = {
      req,
      res: new http.ServerResponse(req),
    } as IProxyContext;
    // websocket 先通过中间件处理后再使用 http-proxy 代理
    this.middleware(ctx).then(() => this.websocketProxy(req, socket, head));
  }
}
