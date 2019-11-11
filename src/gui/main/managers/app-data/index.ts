import { app, MenuItemConstructorOptions, shell } from 'electron';
import * as prompt from 'electron-prompt';
import * as ip from 'ip';
import { Inject, Service } from 'typedi';

import { CertificateService } from '@core/services';
import startProxy from '@core/start';
import { isMac } from '@core/utils';
import { APP_STATES } from '@gui/common/constants';
import { ZAN_PROXY_EVENTS } from '@gui/common/events';
import BaseManager from '@gui/main/core/base-manager';
import { setIpcReplier, showNotify } from '@gui/main/utils';

import { initCert } from './inits';

/**
 * 默认端口信息
 */
export const DEFAULT_PORTS: ZanProxyMac.IPorts = {
  proxyPort: 8001,
  managerPort: 40001,
};

@Service()
export default class AppDataManager extends BaseManager {
  public state: ZanProxyMac.IState = APP_STATES.STOP;
  public ports: ZanProxyMac.IPorts = DEFAULT_PORTS;

  @Inject()
  private certificateService: CertificateService;

  constructor() {
    super();
    this.on('app-data:update-state', this.updateAppState);
    this.on('tray:get-options', this.renderTrayOptions);
  }

  /**
   * 获取 zan-proxy 管理页域名
   * @returns
   */
  public get zanProxyManagerRoot() {
    return `${ip.address()}:${this.ports.managerPort}`;
  }

  public async init() {
    this.ports = this.storage.get('ports', DEFAULT_PORTS);

    if (isMac) {
      // 初始化证书文件
      await initCert();
    }

    // 同步gitlab仓库配置文件
    showNotify({
      title: 'Zan Proxy 正在启动',
      body: 'Zan Proxy 会在后台同步远程数据和启动代理服务器',
    });

    // 启动 zan-proxy
    this.updateAppState(APP_STATES.STARTING);
    await startProxy(this.ports.proxyPort, this.ports.managerPort);
    setIpcReplier(ZAN_PROXY_EVENTS.showManager, this.showManager);
  }

  public async afterInit() {
    this.updateAppState(APP_STATES.RUN);
    this.off('app-data:update-state', this.updateAppState);
    showNotify({
      title: 'Zan Proxy 启动成功！',
      body: `Zan Proxy 正在运行，代理端口为${this.ports.proxyPort}`,
    });
    app.on('activate', () => this.workspaceWindow.open());
    this.workspaceWindow.open();
  }

  /**
   * 在浏览器中打开 zan-proxy 管理界面
   */
  private showManager = (targetPath: string) => {
    shell.openExternal(`http://${this.zanProxyManagerRoot}${targetPath}`);
  };

  /**
   * 更新应用状态
   * @param {ZanProxyMac.IState} newState
   */
  private updateAppState = (newState: ZanProxyMac.IState) => {
    this.state = newState;
    this.application.emitAllManager('tray:render');
  };

  /**
   * 更新端口信息
   * @param {ZanProxyMac.IPorts} ports
   */
  private updatePorts(ports: ZanProxyMac.IPorts) {
    this.storage.set('ports', ports);
  }

  /**
   * 修改端口
   * @param {Partial<ZanProxyMac.IPorts>} ports
   */
  private changePort = (ports: Partial<ZanProxyMac.IPorts>) => {
    const proxyPort = ports.proxyPort || this.ports.proxyPort;
    const managerPort = ports.managerPort || this.ports.managerPort;
    this.updatePorts({ proxyPort, managerPort });
    showNotify({
      title: 'Zan Proxy 通知',
      body: '管理端口设置成功，重启后生效',
    });
  };

  /**
   * zan-proxy-mac 状态菜单项，只做显示，没有功能
   */
  private get appStateItem(): MenuItemConstructorOptions {
    return {
      id: 'appState',
      label: `Zan Proxy ${this.state.text}`,
      enabled: false,
    };
  }

  private cleanCertificates = async () => {
    let cleanResultMsg = '';
    try {
      await this.certificateService.clear();
      cleanResultMsg = '清理证书完毕';
    } catch (err) {
      console.error(err);
      cleanResultMsg = '清理证书失败';
    }
    showNotify({
      title: '清理证书',
      body: cleanResultMsg,
    });
  };

  /**
   * 端口设置菜单项
   */
  private get portItem(): MenuItemConstructorOptions {
    const submenu: MenuItemConstructorOptions[] = [
      {
        id: 'proxyPort',
        label: `设置代理端口 - ${this.ports.proxyPort}`,
        click: () => {
          prompt({
            title: '设置代理端口',
            label: '输入代理端口号：',
            inputAttrs: {
              type: 'number',
            },
            value: this.ports.proxyPort,
          }).then((res: string) => {
            if (!res) {
              return;
            }
            this.changePort({
              proxyPort: parseInt(res),
            });
          });
        },
      },
      {
        id: 'managerPort',
        label: `设置管理端口 - ${this.ports.managerPort}`,
        click: () => {
          prompt({
            title: '设置管理端口',
            label: '输入管理端口号：',
            inputAttrs: {
              type: 'number',
            },
            value: this.ports.managerPort,
          }).then((res: string) => {
            if (!res) {
              return;
            }
            this.changePort({
              managerPort: parseInt(res),
            });
          });
        },
      },
    ];

    return {
      id: 'port',
      label: '端口设置',
      submenu,
      afterGroupContaining: ['setting', 'clean-certificate'],
      beforeGroupContaining: ['quit'],
    };
  }

  /**
   * 通用菜单项（没有特殊功能）
   */
  private get commonTrayItems(): MenuItemConstructorOptions[] {
    return [
      {
        id: 'setting',
        label: '代理设置',
        click: () => {
          this.showManager('');
        },
        afterGroupContaining: ['workspaces'],
        beforeGroupContaining: ['port'],
      },
      {
        id: 'monitor',
        label: '打开监控',
        click: () => {
          this.showManager('/monitor.html');
        },
        afterGroupContaining: ['workspaces'],
        beforeGroupContaining: ['port'],
      },
      {
        id: 'clean-certificate',
        label: '清理证书缓存',
        click: this.cleanCertificates,
        after: ['setting'],
        afterGroupContaining: ['workspaces'],
        beforeGroupContaining: ['port'],
      },
    ];
  }

  private renderTrayOptions = (options: MenuItemConstructorOptions[]) => {
    const initedTrayOptions: MenuItemConstructorOptions[] = this.inited
      ? [...this.commonTrayItems, { type: 'separator' }, this.portItem, { type: 'separator' }]
      : [];
    options.push(...initedTrayOptions);
    options.unshift(this.appStateItem, { type: 'separator' });
  };
}
