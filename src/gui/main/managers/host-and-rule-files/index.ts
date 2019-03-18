import SocketClient from 'socket.io-client';
import Container, { Inject, Service } from 'typedi';
import { ipcMain } from 'electron';
import logger from 'electron-log';

import { HOST_FILE_EVENTS, RULE_FILE_EVENTS } from '@gui/common/events';
import BaseManager from '@gui/main/core/base-manager';
import { showNotify } from '@gui/main/utils';

import AppDataManager from '../app-data';
import { HostService, RuleService } from '@core/App/services';
import syncRules from '@core/syncRule';
import syncHosts from '@core/syncHost';

@Service()
export default class HostAndRuleFilesManager extends BaseManager {
  private socketClient: SocketIOClient.Socket;
  public hostFiles: ZanProxyMac.IHostFile[] = [];
  public ruleFiles: ZanProxyMac.IRuleFile[] = [];

  @Inject(() => AppDataManager)
  private appDataManager: AppDataManager;

  public async init() {
    this.initEventHandlers();
    this.initSocket();

    this.on('workspace:export', this.expandExportData);
    this.on('workspace:import', this.parseImportData);
  }

  public afterInit() {
    this.syncHostAndRules();
  }

  /**
   * 初始化命令行版 zan-proxy socket 监听
   *
   * @private
   * @memberof HostAndRuleFilesManager
   */
  private initSocket() {
    this.socketClient = SocketClient(`http://${this.appDataManager.zanProxyManagerRoot}/manager`);

    this.socketClient.on('hostfilelist', async data => {
      await this.application.emitAllManager('host-and-rule-files:update-host', data);
      // 获取 host 规则列表
      this.hostFiles = data;
      this.workspaceWindow.send(HOST_FILE_EVENTS.list, data);
    });

    this.socketClient.on('rulefilelist', async data => {
      await this.application.emitAllManager('host-and-rule-files:update-rule', data);
      // 获取转发规则列表
      this.ruleFiles = data;
      this.workspaceWindow.send(RULE_FILE_EVENTS.list, data);
    });
  }

  private initEventHandlers() {
    ipcMain.on(HOST_FILE_EVENTS.fetch, () => {
      this.workspaceWindow.send(HOST_FILE_EVENTS.list, this.hostFiles);
    });

    ipcMain.on(RULE_FILE_EVENTS.fetch, () => {
      this.workspaceWindow.send(RULE_FILE_EVENTS.list, this.ruleFiles);
    });
  }

  /**
   * 同步host文件和规则文件
   */
  private async syncHostAndRules() {
    try {
      await syncHosts();
      await syncRules();
    } catch (e) {
      showNotify({
        title: '同步远程数据和启动代理服务器失败',
        body: '已经跳过本次同步,请确认网络环境后重启zan-proxy重试',
      });
    }
  }

  /**
   * 导出工作区字段扩展
   *
   * @private
   * @memberof HostAndRuleFilesManager
   */
  private expandExportData = (dataToExport: ZanProxyMac.IExportOrImportData) => {
    const workspace = dataToExport.workspace;
    // 获取 host 配置
    if (workspace.hosts) {
      const hostService = Container.get<any>(HostService);
      dataToExport.hostFiles = workspace.hosts.map(h => hostService.getHostFile('root', h));
    }
    // 获取 转发规则 配置
    if (workspace.ruleSet) {
      const ruleService = Container.get<any>(RuleService);
      dataToExport.ruleFiles = workspace.ruleSet.map(n => ruleService.getRuleFile('root', n));
    }
  };

  /**
   * 导入工作区解析
   *
   * @private
   * @memberof HostAndRuleFilesManager
   */
  private parseImportData = async (dataToExport: ZanProxyMac.IExportOrImportData) => {
    if (dataToExport.hostFiles) {
      const hostService = Container.get<any>(HostService);
      for (const hostFile of dataToExport.hostFiles) {
        if (hostFile.meta && hostFile.meta.local === false && hostFile.meta.url) {
          // 导入远程 host 文件
          await hostService.importRemoteHostFile('root', hostFile.meta.url);
        } else {
          // 保存 host 文件
          await hostService.saveHostFile('root', hostFile.name, hostFile);
        }
      }
    }

    if (dataToExport.ruleFiles) {
      const ruleService = Container.get<any>(RuleService);
      for (const rf of dataToExport.ruleFiles) {
        rf.checked = false;
        if (rf.meta && rf.meta.remote && rf.meta.url) {
          // 导入远程规则文件
          try {
            await ruleService.importRemoteRuleFile('root', rf.meta.url);
          } catch (e) {
            logger.error(e);
          }
        } else {
          // 保存本地规则文件
          await ruleService.saveRuleFile('root', rf);
        }
      }
    }
  };

  public destory() {
    this.socketClient && this.socketClient.close();
  }
}
