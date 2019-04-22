import { promisify } from 'es6-promisify';
import EventEmitter from 'events';
import fs from 'fs';
import { forEach } from 'lodash';
import path from 'path';
import rimraf from 'rimraf';
import { Service } from 'typedi';
import { UrlWithStringQuery } from 'url';

import {
  IRecord,
  ITrafficOriginRequest,
  ITrafficRecord,
  ITrafficRequestData,
  ITrafficResponse,
} from '@core/types/http-traffic';

import { AppInfoService } from './appInfo';

const fsWriteFile = promisify(fs.writeFile);
const fsReadFile = promisify(fs.readFile);

const MAX_LOG_COUNT = 500;

@Service()
export class HttpTrafficService extends EventEmitter {
  // http请求缓存数据 userId - > [{record}，{record}，{record}]
  private requestCache: IRecord[] = [];

  // 用户的请求id
  private trafficIdPointer: number = 0;

  // 记录用户的监视窗数量
  private monitorCount: number = 0;

  private trafficDir: string;

  /**
   * 记录过滤规则
   */
  private _filter: string = '';

  public get filter(): string {
    return this._filter;
  }

  /**
   * 停止记录标识
   */
  private stopRecord: boolean = false;

  public get status() {
    return {
      /**
       * 是否超过最大记录数量
       */
      overflow: this.trafficIdPointer > MAX_LOG_COUNT,
      /**
       * 是否停止记录
       */
      stopRecord: this.stopRecord || false,
    };
  }

  constructor(appInfoService: AppInfoService) {
    super();
    const proxyDataDir = appInfoService.proxyDataDir;
    // 监控数据缓存目录
    this.trafficDir = path.join(proxyDataDir, 'traffic');

    // 创建定时任务，推送日志记录
    setInterval(() => {
      this.sendCachedData();
    }, 2000);
    try {
      rimraf.sync(this.trafficDir);
      fs.mkdirSync(this.trafficDir);
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 设置记录过滤条件
   */
  public setFilter(filter: string = '') {
    this._filter = filter;
    this.emit('filter', filter);
  }

  /**
   * 设置是否记录标识
   */
  public setStopRecord(stop: boolean) {
    this.stopRecord = stop;
    // 发送通知
    this.emit('state-change', this.status);
  }

  /**
   * 清空记录
   */
  public clear() {
    this.trafficIdPointer = 0;
    // 发送通知
    this.emit('clear');
  }

  /**
   * 将缓存数据发送给用户
   */
  private sendCachedData() {
    this.emit('traffic', this.requestCache);
    this.requestCache = [];
  }

  /**
   * 为请求分配id
   */
  public getTrafficId(urlObj: UrlWithStringQuery) {
    // 处于停止记录状态 则不返回id
    if (this.stopRecord) {
      return null;
    }

    // 获取当前ip
    let currentId = this.trafficIdPointer;

    // 超过500个请求则不再记录
    if (currentId > MAX_LOG_COUNT) {
      return null;
    }

    const filter = this._filter;
    const { href } = urlObj;
    if (href.includes(filter)) {
      currentId++;
      this.trafficIdPointer = currentId;
      if (currentId > MAX_LOG_COUNT) {
        const state = this.status;
        // 向监控窗推送通知
        this.emit('state-change', state);
      }
      return currentId;
    }
    return null;
  }

  public resetTrafficId() {
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
      this.resetTrafficId();
    }
  }

  /**
   * 记录原始请求
   */
  public async recordOriginRequest(record: ITrafficRecord<'originRequest', ITrafficOriginRequest>) {
    this.requestCache.push(record);
  }

  /**
   * 记录请求body
   */
  public async recordActualRequest({
    id,
    requestData,
  }: ITrafficRecord<'requestData', ITrafficRequestData>) {
    const body = requestData.body;
    delete requestData.body;

    this.requestCache.push({
      id,
      requestData,
    });

    // 将body写文件
    if (body) {
      const bodyPath = this.getRequestBodyPath(id);
      await fsWriteFile(bodyPath, body, { encoding: 'utf-8' });
    }
  }

  /**
   * 记录响应
   */
  public async recordResponse(
    record: ITrafficRecord<'response', ITrafficResponse & { body: any }>,
  ) {
    this.requestCache.push(record);

    if ('response' in record) {
      const { id, response } = record;
      const { body } = response;
      if (body) {
        const bodyPath = this.getResponseBodyPath(id);
        await fsWriteFile(bodyPath, body, { encoding: 'utf-8' });
      }
    }
  }

  /**
   * 获取请求的请求内容
   */
  public async getRequestBody(trafficId: string | number) {
    const saveRequestPath = this.getRequestBodyPath(trafficId);
    return await fsReadFile(saveRequestPath, { encoding: 'utf-8' });
  }

  /**
   * 获取请求的响应内容
   */
  public async getResponseBody(trafficId: string | number) {
    const saveResponsePath = this.getResponseBodyPath(trafficId);
    return await fsReadFile(saveResponsePath, { encoding: 'utf-8' });
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
