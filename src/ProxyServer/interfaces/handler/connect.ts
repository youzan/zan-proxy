export interface ConnectHandler {
  httpsPort: number;
  handle(req, socket, head);
  getIP(port): string;
}
