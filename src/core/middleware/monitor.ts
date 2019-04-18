import http from 'http';
import inflate from 'inflation';
import raw from 'raw-body';
import Stream from 'stream';
import { Inject, Service } from 'typedi';
import URL from 'url';

import { HttpTrafficService } from '../services';
import { IProxyContext, IProxyMiddleware, NextFunction } from '../types/proxy';

/**
 * 记录请求数据中间件
 */
@Service()
export class RecordRequestMiddleware implements IProxyMiddleware {
  @Inject() private httpTrafficService: HttpTrafficService;

  /**
   * 获取请求体内容
   */
  async getRequestBody(req: http.IncomingMessage) {
    return req.body ? Promise.resolve(req.body) : raw(inflate(req), 'utf-8');
  }

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (ctx.ignore) {
      return next();
    }
    const { userID, requestID } = ctx;
    if (requestID > 0 && this.httpTrafficService.hasMonitor(userID)) {
      const url = URL.parse(ctx.req.url);
      const { headers, method, httpVersion } = ctx.req;
      this.getRequestBody(ctx.req).then(body => {
        this.httpTrafficService.actualRequest({
          id: requestID,
          originBody: body,
          requestData: {
            body,
            headers,
            httpVersion,
            method,
            path: url.path,
            port: url.port || 80,
            protocol: url.protocol,
          },
          userId: userID,
        });
      });
    }
    ctx.remoteRequestBeginTime = Date.now();
    await next();
    ctx.remoteResponseStartTime = Date.now();
  }
}

/**
 * 记录响应信息中间件
 */
@Service()
// tslint:disable-next-line: max-classes-per-file
export class RecordResponseMiddleware implements IProxyMiddleware {
  @Inject() private httpTrafficService: HttpTrafficService;

  /**
   * 获取响应体内容
   */
  private async getResponseBody(res: http.ServerResponse) {
    const { body } = res;
    if (!body) {
      return Promise.resolve('');
    }
    if (Buffer.isBuffer(body)) {
      return Promise.resolve(body.toString('utf-8'));
    }
    if (typeof body === 'string') {
      return Promise.resolve(body);
    }
    if (body instanceof Stream) {
      return raw(inflate(body), 'utf-8');
    }
  }

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (ctx.ignore) {
      return next();
    }

    const { userID } = ctx;
    const urlObj = URL.parse(ctx.req.url);
    const requestID = this.httpTrafficService.getRequestId(userID, urlObj);

    if (requestID > 0 && this.httpTrafficService.hasMonitor(userID)) {
      ctx.requestID = requestID;
      await this.httpTrafficService.requestBegin({
        clientIp: ctx.clientIP,
        headers: ctx.req.headers,
        httpVersion: ctx.req.httpVersion,
        id: requestID,
        method: ctx.req.method,
        urlObj,
        userId: userID,
      });
    }

    const receiveRequestTime = Date.now();
    await next();

    if (requestID > 0 && this.httpTrafficService.hasMonitor(userID)) {
      const { res, remoteRequestBeginTime, remoteResponseStartTime } = ctx;
      const requestEndTime = Date.now();
      const { statusCode } = res;
      const headers = res.getHeaders();
      this.getResponseBody(res).then(body => {
        this.httpTrafficService.serverReturn({
          id: requestID,
          toClientResponse: {
            body,
            headers,
            receiveRequestTime,
            remoteIp: urlObj.host,
            remoteRequestBeginTime,
            remoteResponseStartTime,
            requestEndTime,
            statusCode,
          },
          userId: userID,
        });
      });
    }
  }
}
