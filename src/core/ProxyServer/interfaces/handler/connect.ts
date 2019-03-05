export interface ConnectHandler {
  httpsPort: number;
  httpPort: number;
  handle(req, socket, head);
  getIP(port): string;
}
