import { promisify } from 'es6-promisify';
import EventEmitter from 'events';
import fs from 'fs';
import { forEach } from 'lodash';
import path from 'path';
import rimraf from 'rimraf';
import { Service } from 'typedi';
import { AppInfoService } from './appInfo';

const fsWriteFile = promisify(fs.writeFile);
const fsReadFile = promisify(fs.readFile);

const logCountPerUser = 500;

@Service()
export class HttpTrafficService extends EventEmitter {
  private cache: object;
  private userRequestPointer: object;
  private userMonitorCount: object;
  private trafficDir: string;
  private filterMap: object;
  private stopRecord: object;
  constructor(appInfoService: AppInfoService) {
    super();
    // http请求缓存数据 userId - > [{record}，{record}，{record}]
    this.cache = {};
    // 用户的请求id  一个用户可以关联多个请求设备，用户的请求分配唯一个一个请求id
    this.userRequestPointer = {};
    // 记录用户的监视窗数量
    this.userMonitorCount = {};

    const proxyDataDir = appInfoService.getProxyDataDir();
    // 监控数据缓存目录
    this.trafficDir = path.join(proxyDataDir, 'traffic');
    this.filterMap = {};
    this.stopRecord = {};

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

  public getFilter(userId) {
    const filters = this.filterMap[userId] || '';
    return filters;
  }

  public setFilter(userId, filter) {
    this.filterMap[userId] = filter;
    this.emit('filter', userId, filter);
  }

  public getStatus(userId) {
    return {
      overflow: this.userRequestPointer[userId] > logCountPerUser,
      stopRecord: this.stopRecord[userId] || false,
    };
  }

  public setStopRecord(userId, stop) {
    this.stopRecord[userId] = stop;
    // 发送通知
    this.emit('state-change', userId, this.getStatus(userId));
  }

  public clear(userId) {
    this.userRequestPointer[userId] = 0;
    // 发送通知
    this.emit('clear', userId);
  }

  // 将缓存数据发送给用户
  public sendCachedData() {
    forEach(this.cache, (rows, userId) => {
      this.emit('traffic', userId, rows);
    });
    this.cache = {};
  }

  // 为请求分配id
  public getRequestId(userId, urlObj) {
    // 处于停止记录状态 则不返回id
    if (this.stopRecord[userId]) {
      return -1;
    }

    // 获取当前ip
    let id = this.userRequestPointer[userId] || 0;

    // 超过500个请求则不再记录
    if (id > logCountPerUser) {
      return -1;
    }

    const filter = this.getFilter(userId);
    const { href } = urlObj;
    if (href.includes(filter)) {
      id++;
      this.userRequestPointer[userId] = id;
      if (id > logCountPerUser) {
        const state = this.getStatus(userId);
        // 向监控窗推送通知
        this.emit('state-change', userId, state);
      }
      return id;
    }
    return -1;
  }

  public resetRequestId(userId) {
    this.userRequestPointer[userId] = 0;
  }

  // 获取监控窗口的数量，没有监控窗口 则不做记录
  public hasMonitor(userId) {
    const cnt = this.userMonitorCount[userId] || 0;
    return cnt > 0;
  }

  // 用户监控窗数加1
  public incMonitor(userId) {
    let cnt = this.userMonitorCount[userId] || 0;
    if (cnt === 0) {
      this.resetRequestId(userId);
    }
    cnt++;
    this.userMonitorCount[userId] = cnt;
  }

  // 用户监控窗数减一
  public decMonitor(userId) {
    let cnt = this.userMonitorCount[userId] || 0;
    cnt--;
    this.userMonitorCount[userId] = cnt;
  }

  // 记录请求
  public async requestBegin({
    id,
    userId,
    clientIp,
    method,
    httpVersion,
    urlObj,
    headers,
  }) {
    const queue = this.cache[userId] || [];
    // 原始请求信息
    queue.push({
      id,
      originRequest: Object.assign(
        {
          clientIp,
          headers,
          httpVersion,
          method,
        },
        urlObj,
      ),
    });

    this.cache[userId] = queue;
  }

  // 记录请求body
  public async actualRequest({ userId, id, requestData, originBody }) {
    // 将body写文件

    const body = requestData.body;
    delete requestData.body;

    const queue = this.cache[userId] || [];
    queue.push({
      id,
      requestData,
    });
    this.cache[userId] = queue;

    if (body) {
      const bodyPath = this.getRequestBodyPath(userId, id);
      await fsWriteFile(bodyPath, body, { encoding: 'utf-8' });
    }
    if (originBody) {
      const bodyPath = this.getOriginRequestBodyPath(userId, id);
      await fsWriteFile(bodyPath, originBody, { encoding: 'utf-8' });
    }
  }

  // 记录响应
  public async serverReturn({ userId, id, toClientResponse }) {
    const queue = this.cache[userId] || [];
    const {
      statusCode,
      headers,
      receiveRequestTime,
      dnsResolveBeginTime,
      remoteRequestBeginTime,
      remoteResponseStartTime,
      remoteResponseEndTime,
      requestEndTime,
      remoteIp,
      body,
    } = toClientResponse;
    queue.push({
      id,
      response: {
        dnsResolveBeginTime,
        headers,
        receiveRequestTime,
        remoteIp,
        remoteRequestBeginTime,
        remoteResponseEndTime,
        remoteResponseStartTime,
        requestEndTime,
        statusCode,
      },
    });

    this.cache[userId] = queue;

    if (body) {
      const bodyPath = this.getResponseBodyPath(userId, id);
      await fsWriteFile(bodyPath, body, { encoding: 'utf-8' });
    }
  }

  /**
   * 获取请求的请求内容
   * @param userId
   * @param requestId
   */
  public async getRequestBody(userId, requestId) {
    const saveRequestPath = this.getRequestBodyPath(userId, requestId);
    return await fsReadFile(saveRequestPath, { encoding: 'utf-8' });
  }

  /**
   * 获取请求的请求内容
   * @param userId
   * @param requestId
   */
  public async getResponseBody(userId, requestId) {
    const saveResponsePath = this.getResponseBodyPath(userId, requestId);
    return await fsReadFile(saveResponsePath, { encoding: 'utf-8' });
  }

  // 获取请求记录path
  private getRequestBodyPath(userId, requestId) {
    return path.join(this.trafficDir, userId + '_' + requestId + '_req_body');
  }

  private getOriginRequestBodyPath(userId, requestId) {
    return path.join(
      this.trafficDir,
      userId + '_' + requestId + '_req_body_origin',
    );
  }

  // 获取响应记录path
  private getResponseBodyPath(userId, requestId) {
    return path.join(this.trafficDir, userId + '_' + requestId + '_res_body');
  }
}
