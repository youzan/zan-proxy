import http from 'http';
import net from 'net';

import { ConnectHandler, HttpHandler, UpgradeHandler } from '../impl';
import fillReqUrl from './fillReqUrl';

export class HttpServer {
  private server: http.Server;
  constructor() {
    this.server = http.createServer();
  }

  public setHttpHandler(httpHandler: HttpHandler) {
    this.server.on('request', httpHandler.handle.bind(httpHandler));
  }

  public setConnectHandler(connectHandler: ConnectHandler) {
    this.server.on('connect', connectHandler.handle.bind(connectHandler));
  }

  /**
   * http upgrade to ws handler
   */
  public setUpgradeHandler(upgradeHandler: UpgradeHandler) {
    this.server.on('upgrade', (req: http.IncomingMessage, socket: net.Socket, head: Buffer) => {
      fillReqUrl(req, 'ws');
      upgradeHandler.handle(req, socket, head);
    });
  }

  public setErrorHandler(errorHandler) {
    this.server.on('error', errorHandler.handle.bind(errorHandler));
  }

  public listen(port: number) {
    this.server.listen(port, '0.0.0.0');
  }
}
