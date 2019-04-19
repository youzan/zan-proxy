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

  public async init(proxyPort: number, managerPort: number) {
    const httpsProxyPort = await getPort({ port: 8989 });
    this.appInfoService.setAppInfo({
      proxyPort,
      managerPort,
      httpsProxyPort,
    });
    await this.proxy.init();
    await this.manager.init();
    this.proxy.ignore(`127.0.0.1:${managerPort}`);
    this.proxy.ignore(`${this.appInfoService.appInfo.LANIp}:${managerPort}`);
  }

  public start() {
    this.proxy.listen(this.appInfoService.appInfo.proxyPort);
    this.manager.listen(this.appInfoService.appInfo.managerPort);
    this.appInfoService.printRuntimeInfo();
  }
}
