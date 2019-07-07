import { AppInfoService } from '@core/services';
import http from 'http';
import net from 'net';
import { Inject, Service } from 'typedi';

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

  private get httpPort() {
    return this.appInfoService.appInfo.proxyPort;
  }

  private get httpsPort() {
    return this.appInfoService.appInfo.httpsProxyPort;
  }

  public async handle(req: http.IncomingMessage, socket: net.Socket) {
    // ws、wss、https协议都会发送connect请求
    const [, targetPort] = (req.url as string).split(':');
    // 非443端口访问则连到 http 服务器上
    const proxyPort = parseInt(targetPort, 10) === 443 ? this.httpsPort : this.httpPort;
    // 和本地对应的服务器建立链接 并告诉客户端连接建立成功
    const conn = net.connect(proxyPort, PROXY_HOST, () => {
      socket.write(`HTTP/${req.httpVersion} 200 OK\r\n\r\n`, 'UTF-8', () => {
        conn.pipe(socket);
        socket.pipe(conn);
      });
    });

    conn.on('error', e => {
      console.error(e);
    });
  }
}
