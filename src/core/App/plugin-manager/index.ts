import { EventEmitter } from 'events';
import fs from 'fs-extra';
import compose from 'koa-compose';
import { map, remove, uniqWith } from 'lodash';
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
    this.refreshPlugins();
  }

  public get allInstalledPlugins() {
    return this.storage.get();
  }

  public get usingPlugins() {
    return new Proxy(this.plugins, {
      set(target, p, value, receiver) {
        throw new Error("can't modify plugins");
      },
    });
  }

  /**
   * 获取插件集合
   */
  public refreshPlugins() {
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
   * 获取组合后的中间件
   */
  public getComposedPluginMiddlewares() {
    return compose(map(this.plugins, plugin => plugin.proxy()));
  }

  /**
   * 获取插件目录
   */
  public getPluginDir(pluginName: string) {
    return path.resolve(this.pluginInstallDir, 'node_modules', pluginName);
  }
}
