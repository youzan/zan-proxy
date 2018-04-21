import HttpProxy from 'http-proxy';
import { UpgradeHandler as IUpgradeHandler } from '../../interfaces';

export class UpgradeHandler implements IUpgradeHandler {
  private proxy: HttpProxy;
  constructor() {
    // 创建httpProxy
    this.proxy = HttpProxy.createProxyServer({
      secure: false, // http-proxy api  在request的option里设置 rejectUnauthorized = false
    });
  }
  public async handle(req, socket, head) {
    // 分配ws mock终端，没有分配到终端的和远程建立连接，分配到mock终端的和mock终端通信
    const host = req.headers.host.split(':')[0];
    const port = req.headers.host.split(':')[1];
    const protocol =
      !!req.connection.encrypted && !/^http:/.test(req.url) ? 'https' : 'http';
    this.proxy.ws(req, socket, head, {
      target: {
        hostname: host,
        port,
        protocol,
      },
    });
  }
}
