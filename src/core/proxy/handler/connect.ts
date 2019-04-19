import http from 'http';
import LRUCache from 'lru-cache';
import net from 'net';
import { Inject, Service } from 'typedi';

import { AppInfoService } from '@core/services';

const PROXY_HOST = '127.0.0.1';

// 对于https协议，client connect请求proxy proxy和https server建立链接
// 此字段记录proxy 请求内部https server链接 和 client的ip 之间的映射关系
// 方便 https server 处理请求时，能够找出对应的client ip

// https ws wss 都会发送connect请求
// 代理服务器的目的只要抓取http https请求
// 折中方案：抓取所有的http请求、端口号为443的https请求
@Service()
export class ConnectHandler {
  @Inject() private appInfoService: AppInfoService;

  private cache: LRUCache<string, any> = new LRUCache({
    max: 500,
    maxAge: 1000 * 60 * 60,
  });

  private get httpPort() {
    return this.appInfoService.appInfo.proxyPort;
  }

  private get httpsPort() {
    return this.appInfoService.appInfo.httpsProxyPort;
  }

  public async handle(req: http.IncomingMessage, socket: net.Socket) {
    // connect请求时 如何判断连到的目标机器是不是https协议？
    // ws、wss、https协议都会发送connect请求
    const [, targetPort] = req.url.split(':');
    // 非443则放行,连到http服务器上
    // proxyHost = host; // ws协议直接和远程服务器链接
    const proxyPort = parseInt(targetPort, 10) === 443 ? this.httpsPort : this.httpPort;
    let IPKey: string;
    // 和远程建立链接 并告诉客户端
    const conn = net.connect(proxyPort, PROXY_HOST, () => {
      IPKey = this._getIPKey(conn.address().port);
      this.cache.set(IPKey, socket.remoteAddress);
      socket.write('HTTP/' + req.httpVersion + ' 200 OK\r\n\r\n', 'UTF-8', () => {
        conn.pipe(socket);
        socket.pipe(conn);
      });
    });

    conn.on('error', e => {
      console.error(e);
      this.cache.del(IPKey);
    });

    conn.on('close', () => {
      this.cache.del(IPKey);
    });
  }

  public getIP(port: number) {
    return this.cache.get(this._getIPKey(port));
  }

  private _getIPKey(port: number) {
    return `https_port_${port}`;
  }
}
