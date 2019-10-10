import { MenuItemConstructorOptions } from 'electron';
import { Inject, Service } from 'typedi';

import { CertificateService } from '@core/services';
import BaseManager from '@gui/main/core/base-manager';
import { showNotify } from '@gui/main/utils';

/**
 * 默认端口信息
 */
export const DEFAULT_PORTS: ZanProxyMac.IPorts = {
  proxyPort: 8001,
  managerPort: 40001,
};

@Service()
export default class CertificateManager extends BaseManager {
  @Inject()
  private certificateService: CertificateService;

  public async init() {
    this.initEventHandler();
  }

  private initEventHandler() {
    this.on('tray:get-options', this.renderTrayOptions);
  }

  private clean = async () => {
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

  private renderTrayOptions = (options: MenuItemConstructorOptions[]) => {
    options.push({
      id: 'clean-certificate',
      label: '清理证书缓存',
      click: this.clean,
    });
  };
}
