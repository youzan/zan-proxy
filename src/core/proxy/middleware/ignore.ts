import { Service } from 'typedi';

import { IProxyContext, IProxyMiddleware, NextFunction } from '../../types/proxy';

/**
 * Ignore 中间件。用于设置 ignore 标识，来告知其他中间件该请求不需要被处理
 *
 * @export
 * @class Ignorer
 */
@Service()
export class IgnoreMiddleware implements IProxyMiddleware {
  private patterns: string[] = [];

  /**
   * 添加 ignore 匹配条件
   */
  public addPattern(pattern: string) {
    if (!this.patterns.includes(pattern)) {
      this.patterns.push(pattern);
    }
  }

  /**
   * 中间件，根据情况在 ctx 对象上添加 ignore 标识
   */
  public async middleware(ctx: IProxyContext, next: NextFunction) {
    ctx.ignore = this.patterns.some(pattern => !!ctx.req.url && ctx.req.url.includes(pattern));
    await next();
  }
}
