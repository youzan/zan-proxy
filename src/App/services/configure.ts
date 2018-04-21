import EventEmitter from 'events';
import jsonfile from 'jsonfile';
import { assign } from 'lodash';
import path from 'path';
import { Service } from 'typedi';
import { AppInfoService } from './appInfo';

export interface Configure {
  gitlabToken: string;
  proxyPort: number;
  requestTimeoutTime: number;
}

const defaultConfigure: Configure = {
  gitlabToken: '',
  proxyPort: 8001,
  requestTimeoutTime: 30000,
};
/**
 * 代理运转需要的规则数据
 * 代理端口、超时时间、gitlab token、工程路径、是否启用转发规则
 * Created by tsxuehu on 8/3/17.
 */
@Service()
export class ConfigureService extends EventEmitter {
  private configureFile: string;
  private configure: Configure;
  constructor(appInfoService: AppInfoService) {
    super();
    const proxyDataDir = appInfoService.getProxyDataDir();
    this.configureFile = path.join(proxyDataDir, 'configure.json');
    this.configure = assign(
      {},
      defaultConfigure,
      jsonfile.readFileSync(this.configureFile),
    );
  }

  // 获取配置
  public getConfigure() {
    return this.configure;
  }

  // 设置配置，保存到文件
  public async setConfigure(userId, configure) {
    this.configure = configure;

    jsonfile.writeFileSync(this.configureFile, this.configure, {
      encoding: 'utf-8',
    });
    // 发送通知
    this.emit('data-change', userId, this.configure);
  }

  // 获取代理端口
  public getProxyPort() {
    return this.configure.proxyPort;
  }
}
