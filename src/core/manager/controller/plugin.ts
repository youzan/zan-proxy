import fs from 'fs-extra';
import Koa, { Context } from 'koa';
import koaMount from 'koa-mount';
import path from 'path';
import { JsonController, Ctx, Get, InternalServerError, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';
import { map } from 'lodash';

import { PluginService } from '@core/services';

@Service()
@JsonController('/plugins')
export class PluginController {
  @Inject() private pluginManager: PluginService;

  @Post('/remove')
  public async remove(@Ctx() ctx: Context) {
    const { name } = ctx.request.body;
    await this.pluginManager.remove(name);
    this.pluginManager.refreshPlugins();
    return true;
  }

  @Get('/list')
  public async list(@Ctx() ctx: Context) {
    const allPluginInfo = await Promise.all(
      this.pluginManager.allInstalledPlugins.map(async plugin => ({
        ...plugin,
        ...(await fs.readJSON(
          path.join(this.pluginManager.getPluginDir(plugin.name), 'package.json'),
        )),
      })),
    );
    return allPluginInfo;
  }

  @Post('/add')
  public async add(@Ctx() ctx: Context) {
    const { name, registry } = ctx.request.body;
    const npmConfig: { [propName: string]: any } = {};
    if (registry) {
      npmConfig.registry = registry;
    }
    try {
      await this.pluginManager.add(name, npmConfig);
      this.pluginManager.refreshPlugins();
    } catch (err) {
      const errorMsg = `安装插件${name}失败`;
      console.error(errorMsg);
      throw new InternalServerError(errorMsg);
    }
    return true;
  }

  @Post('/disabled')
  public async disabled(@Ctx() ctx: Context) {
    const { name, disabled } = ctx.request.body;
    this.pluginManager.setAttrs(name, { disabled });
    this.pluginManager.refreshPlugins();
    return true;
  }

  public mountCustomPlugins(app: Koa) {
    Object.keys(this.pluginManager.usingPlugins).forEach(name => {
      const plugin = this.pluginManager.usingPlugins[name];
      if (plugin.manage) {
        const pluginManager = plugin.manage();
        if (
          Object.prototype.toString.call(pluginManager) === '[object Object]' &&
          // @ts-ignore
          pluginManager.__proto__.constructor.name === 'Application'
        ) {
          app.use(koaMount(`/plugins/${name}`, pluginManager));
        } else {
          console.error(`"${name}" 插件的 manage() 方法需要返回 koa 实例`);
          process.exit(-1);
        }
      }
    });
  }
}
