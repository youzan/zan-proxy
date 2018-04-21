import cookieParser from 'cookie';
import http from 'http';
import koa from 'koa';
import koaBodyParser from 'koa-bodyparser';
import koaMount from 'koa-mount';
import koaQs from 'koa-qs';
import koaStatic from 'koa-static';
import path from 'path';
import SocketIO from 'socket.io';
import { Container, Service } from 'typedi';
import PluginManager from '../plugin-manager';
import {
  ConfigureService,
  HostService,
  HttpTrafficService,
  MockDataService,
  ProfileService,
  RuleService,
} from '../services';
import router from './router';

@Service()
export class Manager {
  private httpTrafficService: HttpTrafficService;
  private configureService: ConfigureService;
  private profileService: ProfileService;
  private hostService: HostService;
  private mockDataService: MockDataService;
  private ruleService: RuleService;

  private pluginManager: PluginManager;

  private app: koa;
  private server: http.Server;
  private io: SocketIO;

  constructor() {
    this.httpTrafficService = Container.get(HttpTrafficService);
    this.configureService = Container.get(ConfigureService);
    this.profileService = Container.get(ProfileService);
    this.hostService = Container.get(HostService);
    this.mockDataService = Container.get(MockDataService);
    this.ruleService = Container.get(RuleService);
    this.pluginManager = Container.get(PluginManager);
    // 初始化koa
    this.app = new koa();
    // query string
    koaQs(this.app);
    // body解析
    this.app.use(koaBodyParser());
    // 路由
    this.app.use(async (ctx, next) => {
      // 取用户Id
      const cookies = cookieParser.parse(ctx.request.headers.cookie || '');
      ctx.userId = cookies.userId || 'root';
      await next();
    });
    this.app.use(router());
    // 静态资源服务
    this.app.use(koaStatic(path.join(__dirname, '../../../site')));
    this.app.use(koaMount('/plugins', this.pluginManager.getUIApp()));
    // 创建server
    this.server = http.createServer(this.app.callback());
    // socketio
    this.io = new SocketIO(this.server);

    // 初始化socket io
    this._initTraffic();
    this._initManger();
  }

  public listen(port) {
    // 启动server
    this.server.listen(port);
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
      // proxy配置
      const config = await this.configureService.getConfigure();
      client.emit('configure', config);
      // 个人配置
      const profile = await this.profileService.getProfile(userId);
      client.emit('profile', profile);
      const mappedClientIps = await this.profileService.getClientIpsMappedToUserId(
        userId,
      );
      client.emit('mappedClientIps', mappedClientIps);
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
    // proxy配置信息
    this.configureService.on('data-change', (userId, configure) => {
      socket.to(userId).emit('configure', configure);
    });
    // 个人配置信息
    this.profileService.on('data-change-profile', (userId, profile) => {
      socket.to(userId).emit('profile', profile);
    });
    this.profileService.on(
      'data-change-clientIpUserMap',
      (userId, clientIpList) => {
        socket.to(userId).emit('mappedClientIps', clientIpList);
      },
    );
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
    const cookies = cookieParser.parse(
      socketIOConn.request.headers.cookie || '',
    );
    return cookies.userId || 'root';
  }
}
