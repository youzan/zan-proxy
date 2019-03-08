import { middleware } from './../middleware';
export interface UpgradeHandler {
  handle(req, socket, head);
  setMiddleware(m: middleware);
}
