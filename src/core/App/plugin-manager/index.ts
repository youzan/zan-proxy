import fs from 'fs-extra';
import koa from 'koa';
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
import { IPluginModule } from './types';

@Service()
export default class PluginManager {
  private storage: PluginStorage;
  private plugins: { [key: string]: IPluginModule };
  private pluginInstallDir: string;

  constructor(appInfoService: AppInfoService) {
    this.pluginInstallDir = path.join(appInfoService.proxyDataDir, 'plugins');
    this.storage = new PluginStorage(this.pluginInstallDir);
    this.plugins = this.storage
      .get()
      .filter(p => !p.disabled)
      .reduce((prev, curr) => {
        try {
          const pluginPath = this.getPluginDir(curr.name);
          if (!fs.existsSync(pluginPath)) {
            throw Error(`plugin ${curr.name} not found`);
          }
          const PluginClass = __non_webpack_require__(pluginPath);
          prev[curr.name] = new PluginClass();
        } catch (error) {
          console.error(
            `plugin "${curr.name}" has a runtime error. please check it.\n${error.stack}`,
          );
          process.exit(-1);
        }
        return prev;
      }, {});
  }
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
  public remove(pluginName) {
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

  public setAttrs(pluginName, attrs) {
    let plugins = this.storage.get();
    plugins = plugins.map(p => {
      if (p.name === pluginName) {
        p = Object.assign(p, attrs);
      }
      return p;
    });
    this.storage.set(plugins);
  }

  public has(name) {
    return !!this.plugins[name];
  }

  public getUIApp() {
    const app = new koa();
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
      ctx.body = {
        message: 'ok',
        status: 200,
      };
    });
    app.use(router.routes()).use(router.allowedMethods());
    return app;
  }

  public getComposedPluginMiddlewares() {
    console.log('getComposedPluginMiddlewares');
    return compose(
      map(filter(this.plugins, plugin => !plugin.disabled), plugin => plugin.proxy.bind(plugin)),
    );
  }

  private getPluginDir(pluginName: string) {
    return path.resolve(this.pluginInstallDir, 'node_modules', pluginName);
  }
}
