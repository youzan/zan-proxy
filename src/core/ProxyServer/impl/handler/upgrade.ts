import http from 'http';
import HttpProxy from 'http-proxy';
import URL from 'url';
import { UpgradeHandler as IUpgradeHandler } from '../../interfaces';

export class UpgradeHandler implements IUpgradeHandler {
  private proxy: HttpProxy;
  private middleware;
  constructor() {
    // 创建httpProxy
    this.proxy = HttpProxy.createProxyServer({
      secure: false, // http-proxy api  在request的option里设置 rejectUnauthorized = false
    });

    this.middleware = () => Promise.resolve(null);
  }
  public setMiddleware(middleware) {
    this.middleware = middleware;
  }
  public async handle(req, socket, head) {
    const ctx = {
      head,
      req,
      res: new http.ServerResponse(req),
      socket,
    };
    this.middleware(ctx).then(() => {
      const { hostname, port, protocol } = URL.parse(req.url);
      this.proxy.ws(req, socket, head, {
        target: {
          hostname,
          port,
          protocol,
        },
      });
    });
  }
}
