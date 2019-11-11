import { ipcMain } from 'electron';
import logger from 'electron-log';
import SocketClient from 'socket.io-client';
import { Inject, Service } from 'typedi';

import { HostService, RuleService } from '@core/services';
import syncHosts from '@core/syncHost';
import syncRules from '@core/syncRule';
import { IHostFile } from '@core/types/host';
import { IRuleFile } from '@core/types/rule';
import { HOST_FILE_EVENTS, RULE_FILE_EVENTS } from '@gui/common/events';
import BaseManager from '@gui/main/core/base-manager';
import { showNotify } from '@gui/main/utils';

import AppDataManager from '../app-data';

@Service()
export default class HostAndRuleFilesManager extends BaseManager {
  private socketClient: SocketIOClient.Socket;

  @Inject()
  private hostService: HostService;

  @Inject()
  private ruleService: RuleService;

  @Inject(() => AppDataManager)
  private appDataManager: AppDataManager;

  public async init() {
    this.initEventHandlers();
    this.initSocket();

    this.on('workspace:export', this.expandExportData);
    this.on('workspace:import', this.parseImportData);
  }

  public async afterInit() {
    try {
      await this.syncHostAndRules();
    } catch (err) {
      console.error('同步 Host 和 Rule 文件失败', err);
    }
  }

  /**
   * 初始化命令行版 zan-proxy socket 监听
   *
   * @private
   * @memberof HostAndRuleFilesManager
   */
  private initSocket() {
    this.socketClient = SocketClient(`http://${this.appDataManager.zanProxyManagerRoot}/manager`);

    this.socketClient.on('hostFileList', async (hostFileList: IHostFile[]) => {
      await this.application.emitAllManager('host-and-rule-files:update-host', hostFileList);
      this.workspaceWindow.send(HOST_FILE_EVENTS.list, hostFileList);
    });

    this.socketClient.on('ruleFileList', async (ruleFileList: IRuleFile[]) => {
      await this.application.emitAllManager('host-and-rule-files:update-rule', ruleFileList);
      this.workspaceWindow.send(RULE_FILE_EVENTS.list, ruleFileList);
    });
  }

  private initEventHandlers() {
    ipcMain.on(HOST_FILE_EVENTS.fetch, () => {
      this.workspaceWindow.send(HOST_FILE_EVENTS.list, this.hostService.getHostFileList());
    });

    ipcMain.on(RULE_FILE_EVENTS.fetch, () => {
      this.workspaceWindow.send(RULE_FILE_EVENTS.list, this.ruleService.getRuleFileList());
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
      dataToExport.hostFiles = workspace.hosts.map(hostName => this.hostService.getHostFile(hostName));
    }
    // 获取 转发规则 配置
    if (workspace.ruleSet) {
      dataToExport.ruleFiles = workspace.ruleSet.map(ruleName => this.ruleService.getRuleFile(ruleName));
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
      for (const hostFile of dataToExport.hostFiles) {
        if (hostFile.meta && hostFile.meta.local === false && hostFile.meta.url) {
          // 导入远程 host 文件
          await this.hostService.importRemoteHostFile(hostFile.meta.url);
        } else {
          // 保存 host 文件
          await this.hostService.saveHostFile(hostFile.name, hostFile);
        }
      }
    }

    if (dataToExport.ruleFiles) {
      for (const ruleFile of dataToExport.ruleFiles) {
        ruleFile.checked = false;
        if (ruleFile.meta && ruleFile.meta.remote && ruleFile.meta.url) {
          // 导入远程规则文件
          try {
            await this.ruleService.importRemoteRuleFile(ruleFile.meta.url);
          } catch (e) {
            logger.error(e);
          }
        } else {
          // 保存本地规则文件
          await this.ruleService.saveRuleFile('root', ruleFile);
        }
      }
    }
  };

  public destory() {
    this.socketClient && this.socketClient.close();
  }
}
