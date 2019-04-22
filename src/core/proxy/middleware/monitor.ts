import decompress from 'decompress-response';
import http from 'http';
import raw from 'raw-body';
import Stream from 'stream';
import { Inject, Service } from 'typedi';
import URL from 'url';

import { HttpTrafficService } from '../../services';
import { IProxyContext, IProxyMiddleware, NextFunction } from '../../types/proxy';

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
    return req.body ? Promise.resolve(req.body) : raw(decompress(req), 'utf-8');
  }

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (ctx.ignore) {
      return next();
    }
    const { trafficId: trafficId } = ctx;
    if (trafficId > 0 && this.httpTrafficService.hasMonitor) {
      const url = URL.parse(ctx.req.url);
      const { headers, method, httpVersion } = ctx.req;
      this.getRequestBody(ctx.req).then(body => {
        this.httpTrafficService.recordActualRequest({
          id: trafficId,
          requestData: {
            body,
            headers,
            httpVersion,
            method,
            path: url.path,
            port: parseInt(url.port) || 80,
            protocol: url.protocol,
          },
        });
      });
    }
    ctx.remoteRequestBeginTime = Date.now();
    await next(); // forward middleware or handler
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
      if (body instanceof http.IncomingMessage) {
        return raw(decompress(body as http.IncomingMessage), 'utf-8');
      } else {
        return raw(body as Stream.Readable, 'utf-8');
      }
    }
  }

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (ctx.ignore) {
      return next();
    }

    const { req } = ctx;
    const urlObj = URL.parse(ctx.req.url);
    const trafficId = this.httpTrafficService.getTrafficId(urlObj);

    const clientIp =
      // x-forwarded-for 处理多次代理转发的情况
      (req.headers['x-forwarded-for'] as string) ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
    if (trafficId > 0 && this.httpTrafficService.hasMonitor) {
      ctx.trafficId = trafficId;
      await this.httpTrafficService.recordOriginRequest({
        id: trafficId,
        originRequest: {
          clientIp,
          headers: ctx.req.headers,
          httpVersion: ctx.req.httpVersion,
          id: trafficId,
          method: ctx.req.method,
          ...urlObj,
        },
      });
    }

    const receiveRequestTime = Date.now();
    await next();

    if (trafficId > 0 && this.httpTrafficService.hasMonitor) {
      const { res, remoteRequestBeginTime, remoteResponseStartTime } = ctx;
      const requestEndTime = Date.now();
      const { statusCode } = res;
      const headers = res.getHeaders();
      this.getResponseBody(res).then(body => {
        this.httpTrafficService.recordResponse({
          id: trafficId,
          response: {
            body,
            headers,
            receiveRequestTime,
            remoteResponseEndTime: receiveRequestTime,
            remoteIp: urlObj.host,
            remoteRequestBeginTime,
            remoteResponseStartTime,
            requestEndTime,
            statusCode,
          },
        });
      });
    }
  }
}
