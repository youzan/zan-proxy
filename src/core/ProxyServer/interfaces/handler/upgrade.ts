import { Middleware } from './../middleware';
export interface UpgradeHandler {
  handle(req, socket, head);
  setMiddleware(m: Middleware);
}
