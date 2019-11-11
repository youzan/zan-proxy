import { app } from 'electron';
import Container, { Service } from 'typedi';

import { PluginService } from '@core/services';
import { APP_STATES } from '@gui/common/constants';
import BaseManager from '@gui/main/core/base-manager';
import { showNotify } from '@gui/main/utils';

@Service()
export default class ZanPorxyPluginManager extends BaseManager {
  public async init() {
    // 安装插件
    await this.application.emitAllManager('app-data:update-state', APP_STATES.INIT_PLUGINS);
    const allPreInstallPlugins = await this.getAllManagerRelyPlugins();
    return this.installPlugin(allPreInstallPlugins);
  }

  private async getAllManagerRelyPlugins() {
    const preInstallPlugins: ZanProxyMac.IPluginPkg[] = [];
    await this.application.emitAllManagerSerial(
      'zan-porxy-plugin.constructor:get-pre-install-plugins',
      preInstallPlugins,
    );
    return preInstallPlugins;
  }

  /**
   * 初始化内置 zan-proxy 插件
   * 文件目录为 .front-end-proxy/plugins
   */
  private async installPlugin(pluginPkgs: ZanProxyMac.IPluginPkg[]) {
    const pluginManager = Container.get(PluginService);
    let pluginsAllInstalled = true;
    const installedPlugins = pluginManager.getPlugins();
    for (const plugin of pluginPkgs) {
      // 检查插件是否已经安装
      const hasInstalled = installedPlugins.filter(i => i.name === plugin.name).length > 0;
      if (hasInstalled) {
        continue;
      }
      pluginsAllInstalled = false;
      // 未安装插件则安装对应的插件
      await pluginManager.add(plugin.name, { registry: plugin.registry });
    }
    if (!pluginsAllInstalled) {
      showNotify({
        title: 'Zan Proxy 通知',
        body: '内部插件初始化安装完成，请重新启动',
      });
      setTimeout(() => {
        app.quit();
      }, 2000);
    }
  }
}
