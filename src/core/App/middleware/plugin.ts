import { Inject, Service } from 'typedi';

import PluginManager from '../plugin-manager';
import { IProxyContext, IProxyMiddleware, IProxyMiddlewareFn, NextFunction } from '../types/proxy';

@Service()
export class PluginMiddleware implements IProxyMiddleware {
  @Inject() private pluginManager: PluginManager;

  private pluginMiddlewareCache: IProxyMiddlewareFn;

  public onInit() {
    this.updateMiddlewareCache();

    this.pluginManager.on('data-change', () => {
      this.updateMiddlewareCache();
    });
  }

  /**
   * 更新插件中间件缓存
   */
  private updateMiddlewareCache() {
    this.pluginMiddlewareCache = this.pluginManager.getComposedPluginMiddlewares();
  }

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (!this.pluginMiddlewareCache) {
      this.updateMiddlewareCache();
    }
    return this.pluginMiddlewareCache(ctx, next);
  }
}
