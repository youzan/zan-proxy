import http from 'http';
import Koa from 'koa';
import koaBodyParser from 'koa-bodyparser';
import koaFavicon from 'koa-favicon';
import koaQs from 'koa-qs';
import koaStatic from 'koa-static';
import path from 'path';
import { useContainer, useKoaServer } from 'routing-controllers';
import Container, { Service } from 'typedi';

import {
  HostController,
  HttpTrafficController,
  MockDataController,
  PluginController,
  ProfileController,
  RuleController,
  SocketController,
  UtilsController,
} from './controller';

useContainer(Container);

const apiControllers = [
  ProfileController,
  HostController,
  HttpTrafficController,
  MockDataController,
  RuleController,
  UtilsController,
  PluginController,
];

@Service()
export class Manager {
  private app: Koa;
  private server: http.Server;

  /**
   * 初始化 koa 应用
   */
  private initKoa() {
    // 初始化koa
    const app = new Koa();

    // 静态资源服务
    app.use(koaStatic(global.__site, { index: 'manager.html' }));
    app.use(koaFavicon(path.join(global.__site, 'favicon.ico')));

    // query string
    koaQs(app);
    // body解析
    app.use(
      koaBodyParser({
        formLimit: '5mb',
        jsonLimit: '5mb',
        textLimit: '5mb',
      }),
    );

    // 路由
    useKoaServer(app, {
      controllers: apiControllers,
    });

    // 挂载自定义插件路由
    Container.get(PluginController).mountCustomPluginsManager(app);

    this.app = app;
    return app;
  }

  public init() {
    this.initKoa();
    // 创建server
    this.server = http.createServer(this.app.callback());
    // 初始化 socket.io
    Container.get(SocketController).init(this.server);
  }

  public listen(port: number, host: string) {
    // 启动server
    this.server.listen(port, host);
  }
}
