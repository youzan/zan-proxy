import { Container, Service } from 'typedi';
import { ProxyServer } from '../../ProxyServer';
import {
  actualRequest,
  endPoint,
  host,
  Ignorer,
  ip,
  rule,
  user,
} from '../middleware';
import PluginManager from '../plugin-manager';
import {
  HostService,
  HttpTrafficService,
  MockDataService,
  ProfileService,
  RuleService,
} from '../services';

@Service()
export class Proxy {
  private server: ProxyServer;
  private ignorer: Ignorer;
  public async listen(port?) {
    this.server.listen(port);
  }

  public ignore(pattern) {
    this.ignorer.addPattern(pattern);
  }

  public async init() {
    this.server = await ProxyServer.create();
    this.ignorer = new Ignorer();
    this.server.use(this.ignorer.middleware.bind(this.ignorer));
    this.server.use(ip());
    this.server.use(user(Container.get(ProfileService)));
    this.server.use(endPoint(Container.get(HttpTrafficService)));
    this.server.use(
      rule({
        mockDataService: Container.get(MockDataService),
        profileService: Container.get(ProfileService),
        ruleService: Container.get(RuleService),
      }),
    );
    const pluginManager: PluginManager = Container.get(PluginManager);
    pluginManager.loadProxyMiddleware(this.server);
    this.server.use(
      host(Container.get(HostService), Container.get(ProfileService)),
    );
    this.server.use(actualRequest(Container.get(HttpTrafficService)));
  }
}
