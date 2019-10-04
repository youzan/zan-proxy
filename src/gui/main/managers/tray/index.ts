import { Menu, MenuItemConstructorOptions, Tray } from 'electron';
/**
 * 系统托盘
 */
import * as path from 'path';
import { Container, Inject, Service } from 'typedi';

import { APP_STATES } from '@gui/common/constants';
import BaseManager from '@gui/main/core/base-manager';

import AppDataManager from '../app-data';
import WorkspaceManager from '../workspace';

const quitItem = {
  id: 'quit',
  role: 'quit',
  label: '退出',
};

@Service()
export default class TrayManager extends BaseManager {
  private tray: Tray = new Tray(path.resolve(global.__static, 'tray.png'));

  @Inject()
  private appDataManager: AppDataManager;

  constructor() {
    super();

    this.on('tray:render', this.renderTray);
  }

  public init() {
    this.renderTray();
  }

  public afterInit() {
    this.renderTray();
  }

  /**
   * 更新托盘标题
   */
  private renderTitle() {
    // 更新 tray title，若应用已经进入运行状态，则显示当前使用的工作区名称，不然显示当前的应用状态
    const currentWorkspace = Container.get(WorkspaceManager).workspaces.find(w => w.checked);
    const title =
      this.appDataManager.state.value === APP_STATES.RUN.value
        ? (currentWorkspace && currentWorkspace.name) || ''
        : this.appDataManager.state.text;
    this.tray.setTitle(title);
  }

  /**
   * 获取所有插件需要渲染的 tray 菜单
   */
  private async getPluginTrayOptions() {
    if (!this.application) {
      return [];
    }
    const menuOptions: MenuItemConstructorOptions[] = [];
    await this.application.emitAllManagerSerial('tray:get-options', menuOptions);
    return menuOptions;
  }

  /**
   * 更新托盘菜单
   */
  private async renderTrayMenu() {
    const template: MenuItemConstructorOptions[] = [...(await this.getPluginTrayOptions()), quitItem];
    this.tray.setContextMenu(Menu.buildFromTemplate(template));
  }

  /**
   * 更新托盘
   */
  private renderTray = async () => {
    await this.renderTrayMenu();
    this.renderTitle();
  };
}
