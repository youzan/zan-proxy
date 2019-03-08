import { Service } from 'typedi';
import { flatMap, compact } from 'lodash';

import BaseManager from '@gui/main/core/base-manager';
import { setIpcReplier } from '@gui/main/utils';
import { PLUGIN_LOADER_EVENTS } from '@gui/common/events';

@Service()
export default class RendererLoaderManager extends BaseManager {
  public async init() {
    this.initIpcEvent();
  }

  /**
   * 初始化 ipc 通信事件
   *
   * @private
   * @memberof RendererLoaderManager
   */
  private initIpcEvent() {
    setIpcReplier(PLUGIN_LOADER_EVENTS.getNames, this.getPluginNames);
  }

  /**
   * 获取插件名称列表
   *
   * @private
   * @memberof RendererLoaderManager
   */
  private getPluginNames = () => {
    return compact(flatMap(this.application.plugins, manager => manager.name));
  };
}
