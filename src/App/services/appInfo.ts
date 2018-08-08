import EventEmitter from 'events';
import ip from 'ip';
import { assign } from 'lodash';
import path from 'path';
import os from 'os';
import { Service } from 'typedi';

export interface AppInfo {
  single: boolean;
  realUiPort: number;
  proxyPort: number;
  pcIp: string;
}

@Service()
export class AppInfoService extends EventEmitter {
  private proxyDataDir: string;
  private appInfo: AppInfo;
  private appDir: string;
  constructor(single = true) {
    super();
    // 用户home目录
    const userHome = os.homedir();
    // proxy data存放目录
    this.proxyDataDir = path.join(userHome, '.front-end-proxy');
    // app信息
    this.appInfo = {
      pcIp: ip.address(),
      proxyPort: 8001,
      realUiPort: 40001,
      single,
    };

    this.appDir = path.join(__dirname, '../../../');
  }

  public getAppDir() {
    return this.appDir;
  }

  /**
   * 设置app 运行信息
   * @param info
   */
  public setAppInfo(info) {
    assign(this.appInfo, info);
    this.emit('data-change', this.appInfo);
  }

  /**
   * 是否是单用户模式
   * @returns {boolean|*}
   */
  public isSingle() {
    return this.appInfo.single;
  }

  /**
   * 本地存放数据的目录
   * @returns {*}
   */
  public getProxyDataDir() {
    return this.proxyDataDir;
  }

  /**
   * 真实的 ui 端口
   * @returns {string}
   */
  public getRealUiPort() {
    return this.appInfo.realUiPort;
  }

  /**
   * 设置真实的 ui 端口
   * @param uiport
   */
  public setRealUiPort(uiport) {
    this.setAppInfo({
      realUiPort: uiport,
    });
  }

  /**
   * 真实的代理端口
   * @returns {string}
   */
  public getHttpProxyPort() {
    return this.appInfo.proxyPort;
  }

  /**
   * 设置正在运行的代理端口
   * @param proxyport
   */
  public setHttpProxyPort(httpProxyPort) {
    this.setAppInfo({
      proxyPort: httpProxyPort,
    });
  }

  /**
   * 获取机器ip
   * @returns {string}
   */
  public getPcIp() {
    return this.appInfo.pcIp;
  }

  // 是否是webui请求
  public isWebUiRequest(hostname, port) {
    return (
      (hostname === '127.0.0.1' || hostname === this.appInfo.pcIp) &&
      port === this.appInfo.realUiPort
    );
  }

  public printRuntimeInfo() {
    console.log(`Proxy Port: ${this.appInfo.proxyPort}`);
    console.log(
      `Manager: http://${this.appInfo.pcIp}:${this.appInfo.realUiPort}`,
    );
  }
}
