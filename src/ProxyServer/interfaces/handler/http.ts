import { middleware } from './../middleware';

export interface HttpHandler {
  handle(req, res);
  setMiddleware(m: middleware);
}
