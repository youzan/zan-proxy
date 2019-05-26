import { Container, Inject, Service } from 'typedi';
import { Manager } from './manager';
import { Proxy } from './proxy';
import { AppInfoService } from './services';

@Service()
export default class App {
  @Inject() private proxy: Proxy;
  @Inject() private manager: Manager;

  public async start(proxyPort: number = 8001, managerPort: number = 40001, managerHost: string) {
    const appInfoService: AppInfoService = Container.get(AppInfoService);
    this.proxy.ignore(`127.0.0.1:${managerPort}`);
    this.proxy.ignore(`${managerHost || appInfoService.getPcIp()}:${managerPort}`);
    this.proxy.listen(proxyPort);
    this.manager.listen(managerPort, managerHost);
    appInfoService.setHttpProxyPort(proxyPort);
    appInfoService.setRealUiPort(managerPort);
    if (managerHost) {
      appInfoService.setRealUiHost(managerHost);
    }
    appInfoService.printRuntimeInfo();
  }

  public async init() {
    await this.proxy.init();
  }
}
