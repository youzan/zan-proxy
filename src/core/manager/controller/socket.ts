import http from 'http';
import SocketIO from 'socket.io';
import { Inject, Service } from 'typedi';

import { HostService, HttpTrafficService, MockDataService, ProfileService, RuleService } from '../../services';
import { IProfile } from '../../types/profile';
import { IMockRecord } from '@core/types/mock';
import { IHostFile } from '@core/types/host';
import { IRuleFile } from '@core/types/rule';

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
      const hostFileList = await this.hostService.getHostFileList();
      client.emit('hostFileList', hostFileList);
      // 规则列表
      const ruleFileList = await this.ruleService.getRuleFileList();
      client.emit('ruleFileList', ruleFileList);
      // 数据文件列表
      const mockDataList = await this.mockDataService.getMockList();
      client.emit('mockDataList', mockDataList);
    });

    // 个人配置
    this.profileService.on('data-change', (profile: IProfile) => {
      socket.emit('profile', profile);
    });
    // host文件变化
    this.hostService.on('data-change', (hostFileList: IHostFile[]) => {
      socket.emit('hostFileList', hostFileList);
    });
    // 规则文件列表
    this.ruleService.on('data-change', (ruleFileList: IRuleFile[]) => {
      socket.emit('ruleFileList', ruleFileList);
    });
    // mock文件列表
    this.mockDataService.on('data-change', (mockFilelist: IMockRecord[]) => {
      socket.emit('mockDataList', mockFilelist);
    });
  }
}
