import Stream from 'stream';

import { HttpHandler as IHttpHandler } from '../../interfaces';

export class HttpHandler implements IHttpHandler {
  private middleware;
  constructor() {
    this.middleware = () => Promise.resolve(null);
  }
  public async handle(req, res) {
    const context: any = {
      req,
      res,
    };
    this.middleware(context).then(() => {
      if (!res.writable || res.finished) {
        return Promise.resolve(false);
      }
      const { body } = res;
      if (!body) {
        res.end('');
      }
      if (Buffer.isBuffer(body)) {
        return res.end(body);
      }
      if ('string' === typeof body) {
        return res.end(body);
      }
      if (body instanceof Stream) {
        return body.pipe(res);
      }
      return res.end(JSON.stringify(body));
    });
  }
  public setMiddleware(middleware) {
    this.middleware = middleware;
  }
}
