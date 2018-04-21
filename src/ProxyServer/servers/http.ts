import http from 'http';

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
    this.server.on('upgrade', upgradeHandler.handle.bind(upgradeHandler));
  }
  public setErrorHandler(errorHandler) {
    this.server.on('error', errorHandler.handle.bind(errorHandler));
  }
  public listen(port) {
    this.server.listen(port, '0.0.0.0');
  }
}
