import http from 'http';
import SocketIO from 'socket.io';
import { Inject, Service } from 'typedi';

import {
  HostService,
  HttpTrafficService,
  MockDataService,
  ProfileService,
  RuleService,
} from '../../services';

@Service()
export class SocketController {
  @Inject() private httpTrafficService: HttpTrafficService;
  @Inject() private profileService: ProfileService;
  @Inject() private hostService: HostService;
  @Inject() private mockDataService: MockDataService;
  @Inject() private ruleService: RuleService;

  private io: SocketIO.Server;
  private server: http.Server;

  public init(server: http.Server) {
    this.server = server;
    this.io = SocketIO(this.server);
    this.initHttpTraffic();
    this.initManger();
  }

  /**
   * http流量监控 webSocket 连接
   */
  private initHttpTraffic() {
    const socket = this.io.of('/http-trafic');
    // 客户端发起连接请求
    socket.on('connection', client => {
      this.httpTrafficService.incMonitor();

      client.on('disconnect', () => {
        this.httpTrafficService.decMonitor();
      });
    });

    // 监听logRespository事件
    this.httpTrafficService.on('records', records => {
      socket.emit('records', records);
    });
    // 状态改变
    this.httpTrafficService.on('state', state => {
      socket.emit('state', state);
    });
  }

  /**
   * 管理界面 webSocket 连接
   */
  private initManger() {
    const socket = this.io.of('/manager');

    // 注册通知
    socket.on('connection', async client => {
      // 监听内部状态的客户端,这些客户端获取当前生效的host、rule
      const userId = 'root';
      client.join(userId);
      // 推送最新数据

      // 个人配置
      const profile = await this.profileService.getProfile();
      client.emit('profile', profile);
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

    // 个人配置
    this.profileService.on('data-change', profile => {
      socket.emit('profile', profile);
    });
    // host文件变化
    this.hostService.on('data-change', (userId, hostFilelist) => {
      socket.emit('hostfilelist', hostFilelist);
    });
    // 规则文件列表
    this.ruleService.on('data-change', (userId, ruleFilelist) => {
      socket.emit('rulefilelist', ruleFilelist);
    });
    // mock文件列表
    this.mockDataService.on('data-change', (userId, dataFilelist) => {
      socket.emit('datalist', dataFilelist);
    });
  }
}
