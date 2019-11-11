import { PluginService } from '@core/services';
import Koa, { Context } from 'koa';
import koaMount from 'koa-mount';
import { Ctx, Get, InternalServerError, JsonController, Post } from 'routing-controllers';
import { Inject, Service } from 'typedi';

@Service()
@JsonController('/plugins')
export class PluginController {
  @Inject() private pluginManager: PluginService;

  @Get('/list')
  public async list(@Ctx() ctx: Context) {
    const allPluginInfo = await Promise.all(
      this.pluginManager.getPlugins().map(async plugin => ({
        ...plugin,
        ...(await this.pluginManager.getPluginPackageJson(plugin.name)),
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
    } catch (err) {
      throw new InternalServerError(`安装插件${name}失败`);
    }
    return true;
  }

  @Post('/toggle')
  public async toggle(@Ctx() ctx: Context) {
    const { name, disabled } = ctx.request.body;
    this.pluginManager.setAttrs(name, { disabled });
    return true;
  }

  @Post('/update')
  public async update(@Ctx() ctx: Context) {
    const { name } = ctx.request.body;
    await this.pluginManager.update(name);
    return true;
  }

  @Post('/remove')
  public async remove(@Ctx() ctx: Context) {
    const { name } = ctx.request.body;
    await this.pluginManager.uninstall(name);
    return true;
  }

  public mountCustomPluginsManager(app: Koa) {
    const plugins = this.pluginManager.getPlugins();
    plugins.forEach(plugin => {
      const { name } = plugin;
      const manage = this.pluginManager.getPluginManage(name);
      if (manage) {
        const pluginManager = manage();
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
