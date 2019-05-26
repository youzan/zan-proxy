import getPort from 'get-port';
import { Inject, Service } from 'typedi';

import { Manager } from './manager';
import { Proxy } from './proxy';
import { AppInfoService } from './services';

@Service()
export default class App {
  @Inject() private appInfoService: AppInfoService;
  @Inject() private manager: Manager;
  @Inject() private proxy: Proxy;

  /**
   * 初始化应用
   */
  public async init(proxyPort: number, managerPort: number, managerHost: string) {
    const httpsProxyPort = await getPort({ port: 8989 });
    this.appInfoService.setAppInfo({
      managerHost,
      managerPort,
      proxyPort,
      httpsProxyPort,
    });
    await this.proxy.init();
    await this.manager.init();
    this.proxy.ignore(`127.0.0.1:${managerPort}`);
    this.proxy.ignore(`${this.appInfoService.appInfo.managerHost}:${managerPort}`);
  }

  /**
   * 启动应用
   */
  public start() {
    this.proxy.listen(this.appInfoService.appInfo.proxyPort);
    this.manager.listen(
      this.appInfoService.appInfo.managerPort,
      this.appInfoService.appInfo.managerHost,
    );
    this.appInfoService.printRuntimeInfo();
  }
}
