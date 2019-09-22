import { EventEmitter } from 'events';
import fs from 'fs-extra';
import compose from 'koa-compose';
import { map, pickBy, remove, uniqWith } from 'lodash';
import { LocalStorage } from 'node-localstorage';
import npm from 'npm';
import path from 'path';
import { Service } from 'typedi';

import { AppInfoService } from './appInfo';

import { IPluginClass, IPluginInfo, IPluginModule } from '../types/plugin';

const key = 'zanproxy-plugins';

@Service()
export class PluginService extends EventEmitter {
  private store: LocalStorage;
  private plugins: { [key: string]: IPluginModule };
  private pluginInstallDir: string;

  constructor(appInfoService: AppInfoService) {
    super();

    this.pluginInstallDir = path.join(appInfoService.proxyDataDir, 'plugins');
    this.store = new LocalStorage(this.pluginInstallDir);
    this.refreshPlugins();
  }

  public setPlugins(value: IPluginInfo[]) {
    this.store.setItem(key, JSON.stringify(value));
  }

  public getPlugins(): IPluginInfo[] {
    try {
      return JSON.parse(this.store.getItem(key) || '[]');
    } catch {
      return [];
    }
  }

  public get allInstalledPlugins() {
    return this.getPlugins();
  }

  public get usingPlugins() {
    return pickBy(this.plugins, p => !p.disabled);
  }

  /**
   * 获取插件集合
   */
  public refreshPlugins() {
    this.plugins = this.getPlugins()
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
          console.error(`plugin "${plugin.name}" has a runtime error. please check it.\n${error.stack}`);
          process.exit(-1);
        }
        return group;
      }, {});
    this.emit('data-change');
  }

  /**
   * 添加插件库
   */
  public add(pluginName: string, npmConfig: any = {}) {
    return new Promise((resolve, reject) => {
      const install = () => {
        npm.commands.install([pluginName, this.pluginInstallDir], async (err: any) => {
          if (err) {
            if (err.code === 'E404') {
              return reject(Error(`插件不存在 ${err.uri}`));
            }
            return reject(err);
          }
          const plugins = uniqWith(
            this.getPlugins().concat([
              {
                name: pluginName,
                version: await this.getPluginVersion(pluginName),
                registry: npmConfig.registry || npm.config.get('registry'),
              },
            ]),
            (p1, p2) => {
              return p1.name === p2.name;
            },
          );
          this.setPlugins(plugins);
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

  public update(pluginName: string) {
    return new Promise((resolve, reject) => {
      const update = () => {
        npm.commands.update([pluginName, this.pluginInstallDir], async err => {
          if (err) {
            return reject(err);
          }
          const plugins = this.getPlugins();
          const plugin = plugins.find(p => p.name === pluginName);
          if (plugin) {
            plugin.version = await this.getPluginVersion(pluginName);
          }
          this.setPlugins(plugins);
          return resolve(plugins);
        });
      };

      const pluginConfig = this.plugins[pluginName];

      const npmConfig = { loglevel: 'silent', prefix: this.pluginInstallDir, registry: pluginConfig.registry };
      if (npm.config.loaded) {
        Object.keys(npmConfig).forEach(k => {
          npm.config.set(k, npmConfig[k]);
        });
        update();
      } else {
        npm.load(npmConfig, () => update());
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
          const plugins = this.getPlugins();
          remove(plugins, p => p.name === pluginName);
          this.setPlugins(plugins);
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
    let plugins = this.getPlugins();
    plugins = plugins.map(p => {
      if (p.name === pluginName) {
        p = Object.assign(p, attrs);
      }
      return p;
    });
    this.setPlugins(plugins);
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

  private async getPluginVersion(pluginName: string) {
    return (await this.getPluginPackageJson(pluginName)).version;
  }

  public async getPluginPackageJson(pluginName: string) {
    return fs.readJSON(path.join(this.getPluginDir(pluginName), 'package.json'));
  }

  /**
   * 获取插件目录
   */
  public getPluginDir(pluginName: string) {
    return path.resolve(this.pluginInstallDir, 'node_modules', pluginName);
  }
}
