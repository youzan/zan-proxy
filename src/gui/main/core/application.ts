import { app } from 'electron';
import logger from 'electron-log';
import * as fs from 'fs-extra';
import * as path from 'path';
import Container, { Service } from 'typedi';

import AppDataManager from '@gui/main/managers/app-data';
import HostAndRuleFilesManager from '@gui/main/managers/host-and-rule-files';
import RendererLoaderManager from '@gui/main/managers/renderer-loader';
import TrayManager from '@gui/main/managers/tray';
import WorkspaceManager from '@gui/main/managers/workspace';
import ZanPorxyPluginManager from '@gui/main/managers/zan-proxy-plugin';

import BaseManager from './base-manager';
import Storage from './storage';
import WorkspaceWindow from './window';

interface IPlugin {
  name: string;
  manager: BaseManager;
}

interface IPluginEntry {
  name: string;
  path: string;
}

type AllEventName = keyof ZanProxyMac.IDataEventMap | keyof ZanProxyMac.IEmptyEventMap;

@Service()
export default class Application {
  /**
   * 是否已经初始化完毕
   * 初始化完毕后不再接受外部的修改操作
   *
   * @private
   * @memberof Application
   */
  private initialized: boolean = false;

  /**
   * 内置的插件
   *
   * @private
   * @type {IPlugin[]}
   * @memberof Application
   */
  private builtInPlugin: IPlugin[] = [
    {
      name: 'zan-proxy-plugin',
      manager: Container.get(ZanPorxyPluginManager),
    },
    {
      name: 'app-data',
      manager: Container.get(AppDataManager),
    },
    {
      name: 'host-and-rule-files',
      manager: Container.get(HostAndRuleFilesManager),
    },
    {
      name: 'workspace',
      manager: Container.get(WorkspaceManager),
    },
    {
      name: 'tray',
      manager: Container.get(TrayManager),
    },
    {
      name: 'renderer-loader',
      manager: Container.get(RendererLoaderManager),
    },
  ];

  /**
   * 外部插件数组
   *
   * @private
   * @type {BaseManager[]}
   * @memberof Application
   */
  private externalPlugins: IPlugin[] = [];

  /**
   * 全部插件数组
   *
   * @readonly
   * @memberof Application
   */
  public get plugins() {
    return [...this.builtInPlugin, ...this.externalPlugins];
  }

  /**
   * 插件 manager 数组
   *
   * @readonly
   * @memberof Application
   */
  public get managers() {
    return this.plugins.map(plugin => plugin.manager);
  }

  constructor() {
    app.on('will-quit', async e => {
      e.preventDefault();
      try {
        this.destory();
      } catch (err) {
        logger.error('Error On Destory Application:', err);
      } finally {
        process.exit(0);
      }
    });
  }

  /**
   * 触发某个 manager 的监听事件
   */
  public async emitOneManager<K extends AllEventName>(
    name: keyof ZanProxyMac.IManagerGroup,
    eventName: K,
    eventData?: MayExistProp<ZanProxyMac.IDataEventMap, K>,
  ) {
    for (const plugin of this.plugins) {
      if (plugin.name === name) {
        // @ts-ignore
        await plugin.manager.emit(eventName, eventData);
      }
    }
  }

  /**
   * 触发某个 manager 的监听事件，并按序执行
   */
  public async emitOneManagerSerial<K extends AllEventName>(
    name: keyof ZanProxyMac.IManagerGroup,
    eventName: K,
    eventData?: MayExistProp<ZanProxyMac.IDataEventMap, K>,
  ) {
    for (const plugin of this.plugins) {
      if (plugin.name === name) {
        // @ts-ignore
        await plugin.manager.emitSerial(eventName, eventData);
      }
    }
  }

  /**
   * 触发所有 manager 的某个监听事件
   */
  public async emitAllManager<K extends AllEventName>(
    eventName: K,
    eventData?: MayExistProp<ZanProxyMac.IDataEventMap, K>,
  ) {
    for (const manager of this.managers) {
      // @ts-ignore
      await manager.emit(eventName, eventData);
    }
  }

  /**
   * 触发所有 manager 的某个监听事件，并按序执行
   */
  public async emitAllManagerSerial<K extends AllEventName>(
    eventName: K,
    eventData?: MayExistProp<ZanProxyMac.IDataEventMap, K>,
  ) {
    for (const manager of this.managers) {
      // @ts-ignore
      await manager.emitSerial(eventName, eventData);
    }
  }

  /**
   * 加载单个插件
   *
   * @private
   * @param {string} pluginPath
   * @memberof Application
   */
  private async loadPluginByEntryItem({ name, path: pluginPath }: IPluginEntry) {
    if (fs.existsSync(pluginPath)) {
      try {
        // 加载 manager 文件
        const pluginModule = __non_webpack_require__(pluginPath);
        // 兼容 es6 default expoort 和 node module.exports
        const plugin: IPlugin = pluginModule.__esModule ? pluginModule.default : pluginModule;

        if (!plugin) {
          throw new Error('文件没有导出内容');
        }

        plugin.name = name;
        this.externalPlugins.push(plugin);
      } catch (err) {
        logger.error(`加载插件 ${name} 失败`, err);
      }
    }
  }

  /**
   * 加载外部插件
   *
   * @param {string[]} pluginNames
   * @memberof Application
   */
  public async loadPlugins(pluginNames: string[]) {
    if (this.initialized) {
      throw new Error('应用已初始化完毕，无法添加新的插件');
    }

    for (const pluginName of pluginNames) {
      const pluginPath = path.resolve(global.__root, 'dist', `${pluginName}.js`);
      await this.loadPluginByEntryItem({
        name: pluginName,
        path: pluginPath,
      });
    }
  }

  /**
   * 给所有 manager 注入指定属性和值
   *
   * @private
   * @memberof Application
   */
  private injectAllManagerProperty<K extends keyof BaseManager>(key: K, value: BaseManager[K]) {
    this.managers.forEach(manager => {
      manager[key] = value;
    });
  }

  /**
   * 初始化
   *
   * @memberof Application
   */
  public async init() {
    if (this.initialized) {
      throw new Error('不可重复初始化应用');
    }

    this.injectAllManagerProperty('application', this);
    this.injectAllManagerProperty('workspaceWindow', Container.get(WorkspaceWindow));
    this.injectAllManagerProperty('storage', Container.get(Storage));
    await this.emitManagersLifecycleFunc('init');
    this.injectAllManagerProperty('inited', true);
    this.initialized = true;
    await this.emitManagersLifecycleFunc('afterInit');
  }

  /**
   * 触发 manager 的生命周期函数
   */
  private async emitManagersLifecycleFunc(lifecycleName: keyof ZanProxyMac.IManagerLifeCycle, ...args: any[]) {
    for (const manager of this.managers) {
      const lifecycleFunc = manager[lifecycleName];
      typeof lifecycleFunc === 'function' && (await lifecycleFunc.call(manager, ...args));
    }
  }

  /**
   * 触发销毁事件
   *
   * @memberof Application
   */
  private destory() {
    return this.emitManagersLifecycleFunc('destory');
  }
}
