import EventEmitter from 'events';
import ip from 'ip';
import { assign } from 'lodash';
import os from 'os';
import path from 'path';
import { Service } from 'typedi';

export interface AppInfo {
  managerPort: number;
  proxyPort: number;
  httpsProxyPort: number;
  LANIp: string;
}

// 用户home目录
const USER_HOME = os.homedir();

@Service()
export class AppInfoService extends EventEmitter {
  /**
   * app信息
   */
  public appInfo: AppInfo = {
    /**
     * 局域网 ip
     */
    LANIp: ip.address(),
    proxyPort: 8001,
    httpsProxyPort: 8989,
    managerPort: 40001,
  };

  /**
   * 存放本地数据的目录
   */
  public get proxyDataDir(): string {
    return path.join(USER_HOME, '.front-end-proxy');
  }

  /**
   * 设置app 运行信息
   * @param info
   */
  public setAppInfo(info: Partial<AppInfo>) {
    assign(this.appInfo, info);
    this.emit('data-change', this.appInfo);
  }

  /**
   * 是否是webui请求
   */
  public isWebuiRequest(hostname: string, port: number) {
    return (
      (hostname === '127.0.0.1' || hostname === this.appInfo.LANIp) &&
      port === this.appInfo.managerPort
    );
  }

  /**
   * 打印运行环境信息
   */
  public printRuntimeInfo() {
    console.log(`Proxy Port: ${this.appInfo.proxyPort}`);
    console.log(`Manager: http://${this.appInfo.LANIp}:${this.appInfo.managerPort}`);
  }
}
