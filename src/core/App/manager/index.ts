import cookieParser from 'cookie';
import http from 'http';
import Koa from 'koa';
import koaBodyParser from 'koa-bodyparser';
import koaFavicon from 'koa-favicon';
import koaQs from 'koa-qs';
import koaStatic from 'koa-static';
import path from 'path';
import { useContainer, useKoaServer } from 'routing-controllers';
import SocketIO from 'socket.io';
import Container, { Inject, Service } from 'typedi';

import {
  HostService,
  HttpTrafficService,
  MockDataService,
  ProfileService,
  RuleService,
} from '../services';
import {
  HostController,
  HttpTrafficController,
  MockDataController,
  PluginsController,
  ProfileController,
  RuleController,
  UtilsController,
} from './controller';

useContainer(Container);

@Service()
export class Manager {
  @Inject() private httpTrafficService: HttpTrafficService;
  @Inject() private profileService: ProfileService;
  @Inject() private hostService: HostService;
  @Inject() private mockDataService: MockDataService;
  @Inject() private ruleService: RuleService;

  private controllers = [
    ProfileController,
    HostController,
    HttpTrafficController,
    MockDataController,
    RuleController,
    UtilsController,
    PluginsController,
  ];

  private app: Koa;
  private server: http.Server;
  private io: SocketIO.Server;

  public init() {
    // 初始化koa
    this.app = new Koa();
    // 静态资源服务
    this.app.use(koaStatic(global.__site, { index: 'manager.html' }));
    this.app.use(koaFavicon(path.join(global.__site, 'favicon.ico')));
    // query string
    koaQs(this.app);
    // body解析
    this.app.use(
      koaBodyParser({
        formLimit: '5mb',
        jsonLimit: '5mb',
        textLimit: '5mb',
      }),
    );

    // 路由
    this.app.use(async (ctx, next) => {
      // 取用户Id
      const cookies = cookieParser.parse(ctx.request.headers.cookie || '');
      ctx.userId = cookies.userId || 'root';
      await next();
    });

    useKoaServer(this.app, {
      controllers: this.controllers,
    });

    // 挂载自定义插件路由
    Container.get(PluginsController).mountCustomPlugins(this.app);

    // 创建server
    this.server = http.createServer(this.app.callback());
    // socketio
    this.io = SocketIO(this.server);

    // 初始化socket io
    this._initTraffic();
    this._initManger();
  }

  // http流量监控界面
  private _initTraffic() {
    const socket = this.io.of('/httptrafic');
    // 客户端发起连接请求
    socket.on('connection', client => {
      const userId = this._getUserId(client);
      client.join(userId);

      this.httpTrafficService.incMonitor(userId);
      // 推送过滤器，状态
      const state = this.httpTrafficService.getStatus(userId);
      client.emit('state', state);
      const filter = this.httpTrafficService.getFilter(userId);
      client.emit('filter', filter);
      client.emit('clear');
      client.on('disconnect', () => {
        this.httpTrafficService.decMonitor(userId);
      });
    });

    // 监听logRespository事件
    this.httpTrafficService.on('traffic', (userId, rows) => {
      socket.to(userId).emit('rows', rows);
    });
    // 过滤器改变
    this.httpTrafficService.on('filter', (userId, filter) => {
      socket.to(userId).emit('filter', filter);
    });
    // 状态改变
    this.httpTrafficService.on('state-change', (userId, state) => {
      socket.to(userId).emit('state', state);
    });
    // 清空
    this.httpTrafficService.on('clear', userId => {
      socket.to(userId).emit('clear');
      const state = this.httpTrafficService.getStatus(userId);
      socket.to(userId).emit('state', state);
    });
  }

  // 管理界面 使用的功能
  private _initManger() {
    const socket = this.io.of('/manager');

    // 注册通知
    socket.on('connection', async client => {
      // 监听内部状态的客户端,这些客户端获取当前生效的host、rule
      const userId = this._getUserId(client);
      client.join(userId);
      // 推送最新数据

      // 个人配置
      const profile = await this.profileService.getProfile();
      client.emit('profile', profile);
      this.profileService.on('data-change', profile => {
        client.emit('profile', profile);
      });

      // host文件列表
      const hostFileList = await this.hostService.getHostFileList(userId);
      client.emit('hostfilelist', hostFileList);
      // 规则列表
      const ruleFileList = await this.ruleService.getRuleFileList(userId);
      client.emit('rulefilelist', ruleFileList);
      // 数据文件列表
      const dataList = await this.mockDataService.getMockDataList(userId);
      client.emit('datalist', dataList);
    });

    // host文件变化
    this.hostService.on('data-change', (userId, hostFilelist) => {
      socket.to(userId).emit('hostfilelist', hostFilelist);
    });
    // 规则文件列表
    this.ruleService.on('data-change', (userId, ruleFilelist) => {
      socket.to(userId).emit('rulefilelist', ruleFilelist);
    });
    // mock文件列表
    this.mockDataService.on('data-change', (userId, dataFilelist) => {
      socket.to(userId).emit('datalist', dataFilelist);
    });
  }

  // 通用函数，获取web socket连接中的用户id
  private _getUserId(socketIOConn) {
    const cookies = cookieParser.parse(socketIOConn.request.headers.cookie || '');
    return cookies.userId || 'root';
  }

  public listen(port) {
    // 启动server
    this.server.listen(port);
  }
}
