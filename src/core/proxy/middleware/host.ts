import { isNull, isUndefined } from 'lodash';
import { Inject, Service } from 'typedi';
import URL from 'url';

import { HostService, ProfileService } from '../../services';
import { IProxyContext, IProxyMiddleware, NextFunction } from '../../types/proxy';

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

    // 转发规则已经设置了响应内容
    const { req, res } = ctx;
    if (!(isNull(res.body) || isUndefined(res.body))) {
      return next();
    }

    const url = URL.parse(req.url as string);
    url.hostname = this.hostService.resolveHost(url.hostname as string);
    // 请求url中包含端口信息时，需要补齐端口信息
    url.host = url.port ? `${url.hostname}:${url.port}` : url.hostname;
    req.url = URL.format(url);
    await next();
  }
}
