import EventEmitter from 'events';
import fs from 'fs-extra';
import path from 'path';
import { Service } from 'typedi';

import { IRecord, ITrafficRecord, ITrafficRequest, ITrafficResponse } from '@core/types/http-traffic';

import { AppInfoService } from './appInfo';

@Service()
@Service('HttpTrafficService')
export class HttpTrafficService extends EventEmitter {
  /**
   * http请求缓存数据
   */
  private recordCache: IRecord[] = [];

  /**
   * 用户的请求id
   */
  private trafficIdPointer: number = 0;

  /**
   * 记录用户的监视窗数量
   */
  private monitorCount: number = 0;

  private trafficDir: string;

  constructor(appInfoService: AppInfoService) {
    super();
    const proxyDataDir = appInfoService.proxyDataDir;
    // 监控数据缓存目录
    this.trafficDir = path.join(proxyDataDir, 'traffic');

    // 创建定时任务，推送日志记录
    setInterval(() => {
      this.sendCachedData();
    }, 2000);
    this.clearTrafficDir();
  }

  /**
   * 清空请求响应体存储目录
   */
  private clearTrafficDir() {
    try {
      fs.removeSync(this.trafficDir);
      fs.mkdirSync(this.trafficDir);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 将缓存数据发送给用户
   */
  private sendCachedData() {
    if (!this.hasMonitor) {
      return;
    }
    this.emit('records', this.recordCache);
    this.recordCache = [];
  }

  /**
   * 为请求分配id
   */
  public getTrafficId() {
    // 没有监视窗口时，不进行记录
    if (!this.hasMonitor) {
      return null;
    }

    // 获取当前ip
    const currentId = ++this.trafficIdPointer;
    return currentId;
  }

  public clear() {
    this.clearTrafficDir();
    this.trafficIdPointer = 0;
  }

  // 获取监控窗口的数量，没有监控窗口 则不做记录
  public get hasMonitor() {
    return this.monitorCount > 0;
  }

  // 用户监控窗数加1
  public incMonitor() {
    this.monitorCount++;
  }

  // 用户监控窗数减一
  public decMonitor() {
    this.monitorCount--;
    if (this.monitorCount === 0) {
      this.clear();
    }
  }

  /**
   * 记录请求body
   */
  public async recordRequest(record: ITrafficRecord<'request', ITrafficRequest>, body: any) {
    this.recordCache.push(record);

    const { id } = record;
    if (body) {
      const bodyPath = this.getRequestBodyPath(id);
      await fs.writeFile(bodyPath, body, { encoding: 'utf-8' });
    }
  }

  /**
   * 记录响应
   */
  public async recordResponse(record: ITrafficRecord<'response', ITrafficResponse>, body: any) {
    this.recordCache.push(record);

    const { id } = record;
    if (body) {
      const bodyPath = this.getResponseBodyPath(id);
      await fs.writeFile(bodyPath, body, { encoding: 'utf-8' });
    }
  }

  /**
   * 获取请求的请求内容
   */
  public async getRequestBody(trafficId: string | number) {
    const saveRequestPath = this.getRequestBodyPath(trafficId);
    if (await fs.pathExists(saveRequestPath)) {
      return fs.readFile(saveRequestPath, { encoding: 'utf-8' });
    }
  }

  /**
   * 获取请求的响应内容
   */
  public async getResponseBody(trafficId: string | number) {
    const saveResponsePath = this.getResponseBodyPath(trafficId);
    if (await fs.pathExists(saveResponsePath)) {
      return fs.readFile(saveResponsePath, { encoding: 'utf-8' });
    }
  }

  /**
   * 获取请求记录path
   */
  private getRequestBodyPath(trafficId: string | number) {
    return path.join(this.trafficDir, `${trafficId}_req_body`);
  }

  /**
   * 获取响应记录path
   */
  private getResponseBodyPath(trafficId: string | number) {
    return path.join(this.trafficDir, `${trafficId}_res_body`);
  }
}
