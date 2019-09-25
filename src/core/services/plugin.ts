import { EventEmitter } from 'events';
import fs from 'fs-extra';
import compose from 'koa-compose';
import { filter, map, pickBy } from 'lodash';
import { LocalStorage } from 'node-localstorage';
import npm from 'npm';
import path from 'path';
import { HttpError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';

import { AppInfoService } from './appInfo';

import { IPluginClass, IPluginInfo, IPluginModule } from '../types/plugin';

const KEY = 'zanproxy-plugins';

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

  /**
   * 判断是否有某个插件
   */
  private has(name: string) {
    return !!this.plugins[name];
  }

  /**
   * 获取插件版本信息
   */
  private async getPluginVersion(pluginName: string) {
    return (await this.getPluginPackageJson(pluginName)).version;
  }

  public setPlugins(value: IPluginInfo[]) {
    this.store.setItem(KEY, JSON.stringify(value));
    this.refreshPlugins();
  }

  public getPlugins(): IPluginInfo[] {
    try {
      return JSON.parse(this.store.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  }

  public getPluginManage(name: string) {
    console.log(name, this.plugins);
    return this.plugins[name].manage;
  }

  public get usingPlugins() {
    return pickBy(this.plugins, p => !p.disabled);
  }

  /**
   * 刷新插件信息
   */
  public refreshPlugins() {
    this.plugins = this.getPlugins().reduce<{ [key: string]: IPluginModule }>((group, plugin) => {
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

  private loadNpmConfig(npmConfig: any, callback: () => void) {
    if (npm.config.loaded) {
      Object.keys(npmConfig).forEach(k => {
        npm.config.set(k, npmConfig[k]);
      });
      callback();
    } else {
      npm.load(npmConfig, () => callback());
    }
  }

  /**
   * 添加插件库
   */
  public add(pluginName: string, npmConfig: any = {}) {
    if (this.has(pluginName)) {
      throw new HttpError(409, '该插件已存在');
    }
    return new Promise((resolve, reject) => {
      const install = () => {
        npm.commands.install([pluginName, this.pluginInstallDir], async (err: any) => {
          if (err) {
            if (err.code === 'E404') {
              return reject(Error(`插件不存在 ${err.uri}`));
            }
            return reject(err);
          }
          const plugins = [
            ...this.getPlugins(),
            {
              name: pluginName,
              version: await this.getPluginVersion(pluginName),
              registry: npmConfig.registry || npm.config.get('registry'),
            },
          ];
          this.setPlugins(plugins);
          return resolve(plugins);
        });
      };
      npmConfig = Object.assign({}, npmConfig, {
        loglevel: 'silent',
        prefix: this.pluginInstallDir,
      });
      this.loadNpmConfig(npmConfig, install);
    });
  }

  public update(pluginName: string) {
    if (!this.has(pluginName)) {
      throw new NotFoundError('该插件不存在');
    }
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
      this.loadNpmConfig(npmConfig, update);
    });
  }

  /**
   * 删除插件库
   */
  public uninstall(pluginName: string) {
    if (!this.has(pluginName)) {
      throw new NotFoundError('该插件不存在');
    }
    return new Promise((resolve, reject) => {
      const uninstall = () => {
        npm.commands.uninstall([pluginName, this.pluginInstallDir], err => {
          if (err) {
            return reject(err);
          }
          const restPlugins = this.getPlugins().filter(p => p.name !== pluginName);
          this.setPlugins(restPlugins);
          return resolve(restPlugins);
        });
      };
      const npmConfig = { loglevel: 'silent', prefix: this.pluginInstallDir };
      this.loadNpmConfig(npmConfig, uninstall);
    });
  }

  /**
   * 设置某个插件的属性
   */
  public setAttrs(pluginName: string, attrs: Partial<IPluginInfo>) {
    if (!this.has(pluginName)) {
      throw new NotFoundError('该插件不存在');
    }
    console.log(this.getPlugins());
    const plugins = this.getPlugins().map(p => {
      if (p.name === pluginName) {
        p = Object.assign(p, attrs);
      }
      return p;
    });
    console.log(plugins);
    this.setPlugins(plugins);
  }

  /**
   * 获取组合后的中间件
   */
  public getComposedPluginMiddlewares() {
    return compose(map(filter(this.plugins, plugin => !plugin.disabled), plugin => plugin.proxy()));
  }

  /**
   * 获取插件目录
   */
  public getPluginDir(pluginName: string) {
    return path.resolve(this.pluginInstallDir, 'node_modules', pluginName);
  }

  /**
   * 获取插件 package.json 信息
   */
  public async getPluginPackageJson(pluginName: string) {
    return fs.readJSON(path.join(this.getPluginDir(pluginName), 'package.json'));
  }
}
