import { IProxyContext, IProxyMiddlewareFn } from '@core/types/proxy';
import http from 'http';
import { ComposedMiddleware } from 'koa-compose';
import Stream from 'stream';
import { Service } from 'typedi';

@Service()
export class RequestHandler {
  private middleware: ComposedMiddleware<IProxyContext> = () => Promise.resolve();

  private responseWriteHandler(ctx: IProxyContext) {
    const { res } = ctx;
    if (!res.writable || res.finished) {
      return false;
    }
    const { body } = res;
    if (!body) {
      return res.end('');
    }
    if (Buffer.isBuffer(body) || typeof body === 'string') {
      return res.end(body);
    }
    // file stream (redirect rule) or request stream
    if (body instanceof Stream) {
      return body.pipe(res);
    }
    // body is object
    return res.end(JSON.stringify(body));
  }

  public setMiddleware(middleware: IProxyMiddlewareFn) {
    this.middleware = middleware;
  }

  public async handle(req: http.IncomingMessage, res: http.ServerResponse) {
    const context = {
      req,
      res,
    } as IProxyContext;
    this.middleware(context).then(() => this.responseWriteHandler(context));
  }
}
