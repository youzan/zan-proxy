import { Inject, Service } from 'typedi';

import { PluginService } from '../../services';
import { IProxyContext, IProxyMiddleware, IProxyMiddlewareFn, NextFunction } from '../../types/proxy';

@Service()
export class PluginMiddleware implements IProxyMiddleware {
  @Inject() private pluginService: PluginService;

  private pluginMiddlewareCache: IProxyMiddlewareFn;

  public onInit() {
    this.updateMiddlewareCache();

    this.pluginService.on('data-change', () => {
      this.updateMiddlewareCache();
    });
  }

  /**
   * 更新插件中间件缓存
   */
  private updateMiddlewareCache() {
    this.pluginMiddlewareCache = this.pluginService.getComposedPluginMiddlewares();
  }

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (!this.pluginMiddlewareCache) {
      this.updateMiddlewareCache();
    }

    return this.pluginMiddlewareCache ? this.pluginMiddlewareCache(ctx, next) : next();
  }
}
