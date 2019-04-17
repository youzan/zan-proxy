import { Container, Service } from 'typedi';

import { ProxyServer } from '../../ProxyServer';
import {
  HostMiddleware,
  IgnoreMiddleware,
  IpMiddleware,
  PluginMiddleware,
  RecordRequestMiddleware,
  RecordResponseMiddleware,
  RuleMiddleware,
  UserMiddleware,
} from '../middleware';
import { IProxyMiddleware } from '../types/proxy';

@Service()
export class Proxy {
  private server: ProxyServer;

  private builtInMiddleware: IProxyMiddleware[] = [
    Container.get(IgnoreMiddleware),
    Container.get(IpMiddleware),
    Container.get(UserMiddleware),
    Container.get(RecordResponseMiddleware),
    Container.get(RuleMiddleware),
    Container.get(PluginMiddleware),
    Container.get(HostMiddleware),
    Container.get(RecordRequestMiddleware),
  ];

  public ignore(pattern: string) {
    Container.get(IgnoreMiddleware).addPattern(pattern);
  }

  private useMiddleware(middlewareCls: IProxyMiddleware) {
    // 中间件 class 初始化
    if (middlewareCls.onInit) {
      middlewareCls.onInit();
    }
    // 中间件 class 挂载
    this.server.use(middlewareCls.middleware.bind(middlewareCls));
  }

  public async init() {
    this.server = await ProxyServer.create();
    this.builtInMiddleware.forEach(middleware => this.useMiddleware(middleware));
  }

  public listen(port: number) {
    this.server.listen(port);
  }
}
