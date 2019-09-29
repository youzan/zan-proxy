import { ICtxTimeTrack, IProxyContext, IProxyMiddleware, NextFunction } from '@core/types/proxy';
import decompress from 'decompress-response';
import http from 'http';
import raw from 'raw-body';
import Stream from 'stream';
import { Inject, Service } from 'typedi';

import { HttpTrafficService } from '../../services';

/**
 * 记录请求数据中间件
 */
@Service()
export class RecordRequestMiddleware implements IProxyMiddleware {
  @Inject() private httpTrafficService: HttpTrafficService;

  /**
   * 获取请求体内容
   */
  private async getRequestBody(req: http.IncomingMessage) {
    return raw(decompress(req), req.headers['content-encoding'] || 'utf-8');
  }

  /**
   * 记录 request 信息
   */
  private async recordRequest(ctx: IProxyContext) {
    const { req, trafficId } = ctx;
    const { headers, method, httpVersion } = req;
    const body = await this.getRequestBody(req);
    const clientIp =
      // x-forwarded-for 处理多次代理转发的情况
      (req.headers['x-forwarded-for'] as string) || req.connection.remoteAddress || req.socket.remoteAddress || '';
    this.httpTrafficService.recordRequest(
      {
        id: trafficId,
        request: {
          originUrl: req._proxyOriginUrl || req.url || '',
          actualUrl: req.url || '',
          httpVersion,
          method: method || 'GET',
          headers,
          clientIp,
        },
      },
      body,
    );
  }

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (ctx.ignore) {
      return next();
    }

    const { trafficId } = ctx;
    if (trafficId > 0 && this.httpTrafficService.hasMonitor) {
      this.recordRequest(ctx);
    }
    ctx.timeTrack.sendRemoteRequest = Date.now();
    await next(); // forward middleware or handler
    ctx.timeTrack.receiveRemoteResponse = Date.now();
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

  /**
   * 记录 response 信息
   */
  private async recordResponse(ctx: IProxyContext) {
    const { res, timeTrack, trafficId } = ctx;
    const { statusCode } = res;
    const headers = res.getHeaders();

    timeTrack.finishRequest = Date.now();
    this.getResponseBody(res).then(body => {
      this.httpTrafficService.recordResponse(
        {
          id: trafficId,
          response: {
            statusCode,
            headers,
            timeTrack,
          },
        },
        body,
      );
    });
  }

  public async middleware(ctx: IProxyContext, next: NextFunction) {
    if (ctx.ignore) {
      return next();
    }

    ctx.timeTrack = {
      receiveRequest: Date.now(),
    } as ICtxTimeTrack;
    const trafficId = this.httpTrafficService.getTrafficId();

    if (!trafficId) {
      return next();
    }

    ctx.trafficId = trafficId;
    await next();
    if (trafficId > 0 && this.httpTrafficService.hasMonitor) {
      this.recordResponse(ctx);
    }
  }
}
