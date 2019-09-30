import { PLUGIN_LOADER_EVENTS } from '@gui/common/events';
import { ipcSend } from '@gui/renderer/utils/ipc';
import { get, has } from 'lodash';
import { action, computed, observable } from 'mobx';

export default class PluginStore {
  @observable names: string[] = [];

  /**
   * editor 展示组件
   *
   * @readonly
   * @memberof RuleFilesStore
   */
  @computed
  public get editorComponents(): Array<React.ComponentClass<{}>> {
    const components: Array<React.ComponentClass<{}>> = [];
    const plugins = window.__plugins;
    this.names.forEach(name => {
      if (plugins[name]) {
        has(plugins[name], 'components.EditorField') && components.push(get(plugins[name], 'components.EditorField'));
      }
    });
    return components;
  }

  constructor() {
    ipcSend(PLUGIN_LOADER_EVENTS.getNames).then(async (names: string[]) => {
      // 先执行 init 初始化函数，再设置 names 到 store 中进行渲染
      await this.execPluginInit(names);
      this.setNames(names);
    });
  }

  /**
   * 调用 rendereer 插件的 init 函数
   *
   * @private
   * @memberof RuleFilesStore
   */
  private async execPluginInit(names: string[]) {
    const plugins = window.__plugins;
    for (const key in plugins) {
      if (plugins.hasOwnProperty(key) && names.includes(key)) {
        const plugin = plugins[key];
        plugin.init && (await plugin.init());
      }
    }
  }

  /**
   * 设置插件 names 数组
   *
   * @param {string[]} names
   * @memberof RuleFilesStore
   */
  @action
  public setNames(names: string[]) {
    this.names = names;
  }
}
