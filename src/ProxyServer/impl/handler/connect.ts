import net from 'net';

import { Cache, ConnectHandler as IConnectHandler } from '../../interfaces';

const proxyHost = '127.0.0.1';

// 对于https协议，client connect请求proxy proxy和https server建立链接
// 此字段记录proxy 请求内部https server链接 和 client的ip 之间的映射关系
// 方便 https server 处理请求时，能够找出对应的client ip

// https ws wss 都会发送connect请求
// 代理服务器的目的只要抓取http https请求
// 折中方案：抓取所有的http请求、端口号为443的https请求
export class ConnectHandler implements IConnectHandler {
  public httpPort: number;
  constructor(public httpsPort: number, private cache: Cache) {}

  public async handle(req, socket) {
    let proxyPort;
    // connect请求时 如何判断连到的目标机器是不是https协议？
    // ws、wss、https协议都会发送connect请求
    const [, targetPort] = req.url.split(':');
    // console.log(typeof req.url, req.url, req.url.split(":"), this.httpsProxyPort)
    if (parseInt(targetPort, 10) === 443) {
      proxyPort = this.httpsPort;
    } else {
      // 非443则放行,连到http服务器上
      // proxyHost = host; // ws协议直接和远程服务器链接
      proxyPort = this.httpPort;
    }
    let IPKey;
    // 和远程建立链接 并告诉客户端
    const conn = net.connect(proxyPort, proxyHost, () => {
      IPKey = this._getIPKey(conn.address().port);
      this.cache.set(IPKey, socket.remoteAddress);
      socket.write(
        'HTTP/' + req.httpVersion + ' 200 OK\r\n\r\n',
        'UTF-8',
        () => {
          conn.pipe(socket);
          socket.pipe(conn);
        },
      );
    });

    conn.on('error', e => {
      console.error(e);
      this.cache.del(IPKey);
    });

    conn.on('close', () => {
      this.cache.del(IPKey);
    });
  }
  public getIP(port) {
    return this.cache.get(this._getIPKey(port));
  }
  private _getIPKey(port) {
    return `https_port_${port}`;
  }
}
