import koa from 'koa';
import koaBodyParser from 'koa-bodyparser';
import koaMount from 'koa-mount';
import Router from 'koa-router';
import { remove, uniqWith } from 'lodash';
import npm from 'npm';
import path from 'path';
import { Service } from 'typedi';
import fs from 'fs';
import { AppInfoService } from '../services';
import Storage from './storage';

export interface Plugin {
  name: string;
  manage();
  proxy();
}

@Service()
export default class PluginManager {
  private storage: Storage;
  private plugins: Plugin[];
  private dir: string;
  constructor(appInfoService: AppInfoService) {
    this.dir = path.join(appInfoService.getProxyDataDir(), 'plugins');
    this.storage = new Storage(this.getDir());
    this.plugins = this.storage
      .get()
      .filter(p => !p.disabled)
      .reduce((prev, curr) => {
        try {
          const pluginPath = this.getPluginDir(curr.name);
          if (!fs.existsSync(pluginPath)) {
            throw Error(`plugin ${curr.name} not found`);
          }
          const pluginClass = require(pluginPath);
          prev[curr.name] = new pluginClass();
        } catch (error) {
          console.error(`plugin "${curr.name}" has a runtime error. please check it.\n${error.stack}`);
          process.exit(-1);
        }
        return prev;
      }, {});
  }
  public add(pluginName, npmConfig = {}) {
    return new Promise((resolve, reject) => {
      const install = () => {
        npm.install(pluginName, this.getDir(), err => {
          if (err) {
            if (err.code === 'E404') {
              return reject(Error(`插件不存在 ${err.uri}`))
            }
            return reject(err);
          }
          const plugins = uniqWith(
            this.storage.get().concat([
              {
                name: pluginName,
              },
            ]),
            (p1, p2) => {
              return p1.name === p2.name;
            },
          );
          this.storage.set(plugins);
          return resolve(plugins);
        });
      };
      npmConfig = Object.assign({}, npmConfig, {
        loglevel: 'silent',
        prefix: this.getDir(),
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
        npm.uninstall(pluginName, this.getDir(), err => {
          if (err) {
            return reject(err);
          }
          const plugins = this.storage.get();
          remove(plugins, p => p.name === pluginName);
          this.storage.set(plugins);
          return resolve(plugins);
        });
      };
      const npmConfig = { loglevel: 'silent', prefix: this.getDir() };
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
          Object.prototype.toString.call(pluginApp) == '[object Object]' &&
          pluginApp.__proto__.constructor.name === 'Application'
        ) {
          app.use(koaMount(`/${name}`, plugin.manage()));
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
            require(path.join(
              this.getPluginDir(plugin.name),
              './package.json',
            )),
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

  public loadProxyMiddleware(server) {
    Object.keys(this.plugins).forEach(name => {
      const plugin = this.plugins[name];
      server.use(plugin.proxy(server));
    });
  }

  private getDir() {
    return this.dir;
  }

  private getPluginDir(pluginName) {
    return path.resolve(this.getDir(), 'node_modules', pluginName);
  }
}
