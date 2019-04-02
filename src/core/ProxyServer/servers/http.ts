import http from 'http';
import net from 'net';
import fillReqUrl from './fillReqUrl';

export class HttpServer {
  private server: http.Server;
  constructor() {
    this.server = http.createServer();
  }
  public setHttpHandler(httpHandler) {
    this.server.on('request', httpHandler.handle.bind(httpHandler));
  }
  public setConnectHandler(connectHandler) {
    this.server.on('connect', connectHandler.handle.bind(connectHandler));
  }
  public setUpgradeHandler(upgradeHandler) {
    this.server.on('upgrade', (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
      fillReqUrl(req, 'ws');
      upgradeHandler.handle(req, socket, head);
    });
  }
  public setErrorHandler(errorHandler) {
    this.server.on('error', errorHandler.handle.bind(errorHandler));
  }
  public listen(port) {
    this.server.listen(port, '0.0.0.0');
  }
}
