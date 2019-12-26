import { dialog, ipcMain, MenuItemConstructorOptions, Notification } from 'electron';
import logger from 'electron-log';
import * as fs from 'fs-extra';
import { Container, Service } from 'typedi';
import uuid from 'uuid/v4';

import { APP_STATES } from '@gui/common/constants';
import { WORKSPACE_EVENTS } from '@gui/common/events';
import BaseManager from '@gui/main/core/base-manager';
import { homePath, setIpcReplier, showNotify } from '@gui/main/utils';

import helper from './helper';

@Service()
export default class WorkspaceManager extends BaseManager {
  public workspaces: ZanProxyMac.IWorkspace[] = [];

  /**
   * 初始化工作区数据
   *
   * @memberof WorkspaceManager
   */
  public async init() {
    this.initEventHandler();
    this.initIpcHandlers();

    // 初始化工作区配置
    await this.application.emitAllManager('app-data:update-state', APP_STATES.INIT_MANAGER);
    // 从本地读取配置工作区信息
    let workspaces = this.storage.get('proxy_workspaces') || [];
    // 旧版本数据处理
    if (typeof workspaces === 'string') {
      workspaces = JSON.parse(workspaces);
    }
    this.workspaces = workspaces;

    this.emit('workspace:update-list', this.workspaces);
  }

  public async afterInit() {
    // 激活选中的工作区
    const checkedWorkspace = this.workspaces.find(ws => ws.checked);
    if (!checkedWorkspace) {
      return;
    }
    await this.activateWorkspace(checkedWorkspace).catch(err => {
      logger.error('激活工作区失败', err);
      showNotify({
        title: '激活工作区失败',
        body: '请检查网络和配置后重试',
      });
    });
  }

  private async syncUpdate() {
    // 保存工作区信息，并触发 update 事件
    this.storage.set('proxy_workspaces', this.workspaces);
    await this.application.emitAllManager('workspace:update-list', this.workspaces);
  }

  private initEventHandler() {
    this.on('tray:get-options', this.renderTrayOptions);

    // 工作区发生更新，通知 render 进程更新界面
    this.on('workspace:update-list', () => {
      this.workspaceWindow.send(WORKSPACE_EVENTS.list, this.workspaces);
      this.application.emitOneManager('tray', 'tray:render');
    });
  }

  private initIpcHandlers() {
    ipcMain.on(WORKSPACE_EVENTS.fetch, () => {
      this.workspaceWindow.send(WORKSPACE_EVENTS.list, this.workspaces);
    });
    setIpcReplier(WORKSPACE_EVENTS.create, this.createWorkspace);
    setIpcReplier(WORKSPACE_EVENTS.activate, this.activateWorkspace);
    setIpcReplier(WORKSPACE_EVENTS.deactivate, this.deactivateWorkspace);
    setIpcReplier(WORKSPACE_EVENTS.remove, this.removeWorkspace);
    setIpcReplier(WORKSPACE_EVENTS.save, this.saveWorkspace);
    setIpcReplier(WORKSPACE_EVENTS.sort, this.sortWorkspaces);
    setIpcReplier(WORKSPACE_EVENTS.import, this.importWorkspace);
    setIpcReplier(WORKSPACE_EVENTS.export, this.exportWorkspace);
  }

  /**
   * 创建一个空的工作区
   */
  public createWorkspace = async () => {
    const emptyWorkspace: Partial<ZanProxyMac.IWorkspace> = {
      key: '',
      meta: {
        remote: false,
      },
      name: '',
      checked: false,
      enableHost: false,
      hosts: [],
      enableRule: false,
      ruleSet: [],
    };

    await this.application.emitAllManager('workspace:create', emptyWorkspace);
    return emptyWorkspace;
  };

  /**
   * 重新设置工作区数组
   *
   * @param {ZanProxyMac.IWorkspace[]} workspaces
   */
  public setWorkspaces = async (workspaces: ZanProxyMac.IWorkspace[]) => {
    this.workspaces = workspaces;
    await this.syncUpdate();
  };

  /**
   * 工作区排序
   */
  public sortWorkspaces = async (from: number, to: number) => {
    this.workspaces.splice(to, 0, this.workspaces.splice(from, 1)[0]);
    await this.syncUpdate();
  };

  /**
   * 启用某个工作区
   */
  private activateWorkspace = async (workspace: ZanProxyMac.IWorkspace) => {
    const targetKey = workspace.key;
    this.workspaces.forEach(ws => {
      ws.checked = ws.key === targetKey;
    });
    await helper.activateWorkspace(workspace);
    await this.application.emitAllManager('workspace:activate', workspace);
    await this.syncUpdate();
  };

  /**
   * 停用某个工作区
   */
  private deactivateWorkspace = async (workspace: ZanProxyMac.IWorkspace) => {
    const ws = this.workspaces.find(ws => ws.key === workspace.key);
    ws && (ws.checked = false);
    await helper.deactivateWorkspace(workspace);
    await this.application.emitAllManager('workspace:deactivate', workspace);
    await this.syncUpdate();
  };

  /**
   * 保存工作区
   */
  private saveWorkspace = async (workspace: ZanProxyMac.IWorkspace) => {
    const targetWsIndex = this.workspaces.findIndex(ws => ws.key === workspace.key);
    const isNew = targetWsIndex === -1;
    if (isNew) {
      // 保存新的工作区
      workspace.key = workspace.key || uuid();
      this.workspaces.push(workspace);
    } else {
      // 更新旧的工作区
      const { checked, ...workspaceParams } = workspace;
      Object.assign(this.workspaces[targetWsIndex], workspaceParams);
    }
    await this.syncUpdate();
    return workspace;
  };

  /**
   * 删除工作区
   */
  private removeWorkspace = async (key: string) => {
    this.workspaces = this.workspaces.filter(ws => ws.key !== key);
    await this.syncUpdate();
  };

  /**
   * 导出工作区
   */
  private exportWorkspace = async (workspace: ZanProxyMac.IWorkspace) => {
    function getExportPath(i: number = 0) {
      const exportPath = homePath(
        'Downloads',
        i ? `zpws-${workspace.name} (${i}).json` : `zpws-${workspace.name}.json`,
      );
      if (fs.existsSync(exportPath)) {
        return getExportPath(i + 1);
      }
      return exportPath;
    }
    const exportPath = getExportPath();
    const dataToExport: ZanProxyMac.IExportOrImportData = {
      workspace,
    };

    await this.application.emitAllManager('workspace:export', dataToExport);

    fs.writeJSONSync(exportPath, dataToExport, { encoding: 'utf-8' });
  };

  /**
   * 导入工作区配置
   */
  private importWorkspace = async () => {
    const selectedFiles = dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'json文件', extensions: ['json'] }],
    });
    const filePath = selectedFiles && selectedFiles[0];
    if (!filePath) {
      return;
    }

    const dataToImport: ZanProxyMac.IExportOrImportData = fs.readJSONSync(filePath, {
      encoding: 'utf-8',
    });

    await this.application.emitAllManager('workspace:import', dataToImport);
    const importedWs = dataToImport.workspace;
    if (!importedWs) {
      return;
    }
    importedWs.key = uuid();
    await this.saveWorkspace(importedWs);

    new Notification({
      title: '成功导入',
      body: `导入${importedWs.name}完成`,
      silent: true,
    }).show();
    return importedWs;
  };

  /**
   * 工作区切换菜单项
   */
  private renderTrayOptions = (options: MenuItemConstructorOptions[]) => {
    const manager = Container.get(WorkspaceManager);
    let label = '切换环境';

    for (const ws of manager.workspaces) {
      if (ws.checked) {
        label = `${label} - ${ws.name}`;
        break;
      }
    }

    // 工作区子菜单项
    const submenu: MenuItemConstructorOptions[] = [
      ...manager.workspaces.map<MenuItemConstructorOptions>(ws => ({
        label: ws.name,
        checked: ws.checked,
        type: 'radio',
        click() {
          if (ws.checked) {
            manager.deactivateWorkspace(ws);
            return;
          }
          manager.activateWorkspace(ws);
        },
      })),
      { type: 'separator' },
      {
        label: '导入配置',
        click() {
          manager.importWorkspace();
        },
      },
      {
        label: '打开设置',
        click: () => this.workspaceWindow.open(),
      },
    ];

    options.push(
      {
        id: 'workspaces',
        label,
        submenu,
        afterGroupContaining: ['appState'],
        beforeGroupContaining: ['setting'],
      },
      { type: 'separator' },
    );
  };
}
