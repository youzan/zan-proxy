import { Service } from 'typedi';

import { IProxyContext, IProxyMiddleware, NextFunction } from '../../types/proxy';

@Service()
export class UserMiddleware implements IProxyMiddleware {
  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (ctx.ignore) {
      return next();
    }
    ctx.userID = 'root';
    await next();
  }
}
