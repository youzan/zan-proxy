import { Service } from 'typedi';

import { IProxyContext, IProxyMiddleware, NextFunction } from '../types/proxy';

@Service()
export class IpMiddleware implements IProxyMiddleware {
  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (ctx.ignore) {
      return next();
    }

    const req = ctx.req;
    ctx.clientIP =
      (req.headers['x-forwarded-for'] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
    await next();
  }
}
