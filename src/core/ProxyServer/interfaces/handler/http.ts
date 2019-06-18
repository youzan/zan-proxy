import { Middleware } from './../middleware';

export interface HttpHandler {
  handle(req, res);
  setMiddleware(m: Middleware);
}
