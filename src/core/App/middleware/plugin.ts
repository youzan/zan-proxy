import { Inject, Service } from 'typedi';

import PluginManager from '../plugin-manager';
import { IProxyContext, IProxyMiddleware, NextFunction } from '../types/proxy';

@Service()
export class PluginMiddleware implements IProxyMiddleware {
  @Inject() private pluginManager: PluginManager;

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    return await this.pluginManager.getComposedPluginMiddlewares()(ctx, next);
  }
}
