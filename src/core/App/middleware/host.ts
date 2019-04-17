import { isNull, isUndefined } from 'lodash';
import { Inject, Service } from 'typedi';
import URL from 'url';

import { HostService, ProfileService } from '../services';
import { IProxyContext, IProxyMiddleware, NextFunction } from '../types/proxy';

/**
 * host 解析中间件
 */
@Service()
export class HostMiddleware implements IProxyMiddleware {
  @Inject() private hostService: HostService;
  @Inject() private profileService: ProfileService;

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (ctx.ignore) {
      return next();
    }

    // 未启用 host 解析
    if (!this.profileService.enableHost) {
      return next();
    }

    const { req, res } = ctx;
    if (!(isNull(res.body) || isUndefined(res.body))) {
      return next();
    }

    const url = URL.parse(req.url);
    url.hostname = await this.hostService.resolveHost(url.hostname);
    url.host = url.hostname;
    if (url.port) {
      url.host = `${url.host}:${url.port}`;
    }
    req.url = URL.format(url);
    await next();
  }
}
