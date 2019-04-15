import { Container, Inject, Service } from 'typedi';

import { Manager } from './manager';
import { Proxy } from './proxy';
import { AppInfoService } from './services';

@Service()
export default class App {
  @Inject() private proxy: Proxy;
  @Inject() private manager: Manager;

  public async init() {
    await this.proxy.init();
  }

  public async start(proxyPort: number, managerPort: number) {
    const appInfoService: AppInfoService = Container.get(AppInfoService);
    this.proxy.ignore(`127.0.0.1:${managerPort}`);
    this.proxy.ignore(`${appInfoService.appInfo.LANIp}:${managerPort}`);
    this.proxy.listen(proxyPort);
    this.manager.listen(managerPort);
    appInfoService.setAppInfo({
      proxyPort,
      managerPort,
    });
    appInfoService.printRuntimeInfo();
  }
}
