import { EventEmitter } from 'events';
import fs from 'fs-extra';
import Koa from 'koa';
import koaBodyParser from 'koa-bodyparser';
import compose from 'koa-compose';
import koaMount from 'koa-mount';
import Router from 'koa-router';
import { filter, map, remove, uniqWith } from 'lodash';
import npm from 'npm';
import path from 'path';
import { Service } from 'typedi';

import { AppInfoService } from '../services';
import PluginStorage from './storage';
import { IPluginClass, IPluginInfo, IPluginModule } from './types';

@Service()
export default class PluginManager extends EventEmitter {
  private storage: PluginStorage;
  private plugins: { [key: string]: IPluginModule };
  private pluginInstallDir: string;

  constructor(appInfoService: AppInfoService) {
    super();

    this.pluginInstallDir = path.join(appInfoService.proxyDataDir, 'plugins');
    this.storage = new PluginStorage(this.pluginInstallDir);
    this.getPluginsFromStorage();
  }

  /**
   * 获取插件集合
   */
  private getPluginsFromStorage() {
    this.plugins = this.storage
      .get()
      .filter(p => !p.disabled)
      .reduce<{ [key: string]: IPluginModule }>((group, plugin) => {
        try {
          const pluginPath = this.getPluginDir(plugin.name);
          if (!fs.existsSync(pluginPath)) {
            throw Error(`plugin ${plugin.name} not found`);
          }
          delete require.cache[pluginPath];
          const pluginClassInstance: IPluginClass = new (__non_webpack_require__(pluginPath))();
          group[plugin.name] = {
            ...plugin,
            proxy: pluginClassInstance.proxy.bind(pluginClassInstance),
            manage: pluginClassInstance.manage.bind(pluginClassInstance),
          };
        } catch (error) {
          console.error(
            `plugin "${plugin.name}" has a runtime error. please check it.\n${error.stack}`,
          );
          process.exit(-1);
        }
        return group;
      }, {});
    this.emit('data-change');
  }

  /**
   * 添加插件库
   */
  public add(pluginName: string, npmConfig = {}) {
    return new Promise((resolve, reject) => {
      const install = () => {
        npm.commands.install([pluginName, this.pluginInstallDir], (err: any) => {
          if (err) {
            if (err.code === 'E404') {
              return reject(Error(`插件不存在 ${err.uri}`));
            }
            return reject(err);
          }
          const plugins = uniqWith(
            this.storage.get().concat([
              {
                name: pluginName,
                version: '',
              },
            ]),
            (p1, p2) => {
              // @ts-ignore
              return p1.name === p2.name;
            },
          );
          this.storage.set(plugins);
          return resolve(plugins);
        });
      };
      npmConfig = Object.assign({}, npmConfig, {
        loglevel: 'silent',
        prefix: this.pluginInstallDir,
      });
      if (npm.config.loaded) {
        Object.keys(npmConfig).forEach(k => {
          npm.config.set(k, npmConfig[k]);
        });
        install();
      } else {
        npm.load(npmConfig, () => install());
      }
    });
  }

  /**
   * 删除插件库
   */
  public remove(pluginName: string) {
    return new Promise((resolve, reject) => {
      const uninstall = () => {
        npm.commands.uninstall([pluginName, this.pluginInstallDir], err => {
          if (err) {
            return reject(err);
          }
          const plugins = this.storage.get();
          // @ts-ignore
          remove(plugins, p => p.name === pluginName);
          this.storage.set(plugins);
          return resolve(plugins);
        });
      };
      const npmConfig = { loglevel: 'silent', prefix: this.pluginInstallDir };
      if (npm.config.loaded) {
        Object.keys(npmConfig).forEach(k => {
          npm.config.set(k, npmConfig[k]);
        });
        uninstall();
      } else {
        npm.load(npmConfig, () => uninstall());
      }
    });
  }

  /**
   * 设置某个插件的属性
   */
  public setAttrs(pluginName: string, attrs: Partial<IPluginInfo>) {
    let plugins = this.storage.get();
    plugins = plugins.map(p => {
      if (p.name === pluginName) {
        p = Object.assign(p, attrs);
      }
      return p;
    });
    this.storage.set(plugins);
  }

  /**
   * 判断是否有某个插件
   */
  public has(name: string) {
    return !!this.plugins[name];
  }

  /**
   * 获取 ui 展示的 koa 实例
   */
  public getUIApp() {
    const app = new Koa();
    app.use(koaBodyParser());

    Object.keys(this.plugins).forEach(name => {
      const plugin = this.plugins[name];
      if (plugin.manage) {
        const pluginApp = plugin.manage();
        if (
          Object.prototype.toString.call(pluginApp) === '[object Object]' &&
          // @ts-ignore
          pluginApp.__proto__.constructor.name === 'Application'
        ) {
          app.use(koaMount(`/${name}`, pluginApp));
        } else {
          console.error(`"${name}" 插件的 manage() 方法需要返回 koa 实例`);
          process.exit(-1);
        }
      }
    });

    const router = new Router();
    router.post('/remove', async ctx => {
      const { name } = ctx.request.body;
      await this.remove(name);
      this.getPluginsFromStorage();
      ctx.body = {
        message: 'ok',
        status: 200,
      };
    });
    router.get('/list', async ctx => {
      ctx.body = {
        data: this.storage.get().map(plugin => {
          return Object.assign(
            {},
            plugin,
            fs.readJsonSync(path.join(this.getPluginDir(plugin.name), 'package.json')),
          );
        }),
        status: 200,
      };
    });
    router.post('/add', async ctx => {
      const { name, registry } = ctx.request.body;
      const npmConfig: { [propName: string]: any } = {};
      if (registry) {
        npmConfig.registry = registry;
      }
      try {
        await this.add(name, npmConfig);
        this.getPluginsFromStorage();
      } catch (err) {
        ctx.status = 400;
        ctx.body = err.message;
        return;
      }
      ctx.body = {
        message: 'ok',
        status: 200,
      };
    });

    router.post('/disabled', async ctx => {
      const { name, disabled } = ctx.request.body;
      this.setAttrs(name, { disabled });
      this.getPluginsFromStorage();
      ctx.body = {
        message: 'ok',
        status: 200,
      };
    });
    app.use(router.routes()).use(router.allowedMethods());
    return app;
  }

  /**
   * 获取组合后的中间件
   */
  public getComposedPluginMiddlewares() {
    return compose(map(this.plugins, plugin => plugin.proxy()));
  }

  /**
   * 获取插件目录
   */
  private getPluginDir(pluginName: string) {
    return path.resolve(this.pluginInstallDir, 'node_modules', pluginName);
  }
}
