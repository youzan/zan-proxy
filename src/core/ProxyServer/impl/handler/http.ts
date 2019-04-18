import http from 'http';
import { ComposedMiddleware } from 'koa-compose';
import Stream from 'stream';
import { Service } from 'typedi';

import { IProxyContext, IProxyMiddlewareFn } from '@core/App/types/proxy';

@Service()
export class HttpHandler {
  private middleware: ComposedMiddleware<IProxyContext> = () => Promise.resolve(null);

  public async handle(req: http.IncomingMessage, res: http.ServerResponse) {
    const context = {
      req,
      res,
    } as IProxyContext;
    this.middleware(context).then(() => {
      if (!res.writable || res.finished) {
        return false;
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

  public setMiddleware(middleware: IProxyMiddlewareFn) {
    this.middleware = middleware;
  }
}
