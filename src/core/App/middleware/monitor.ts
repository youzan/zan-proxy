import inflate from 'inflation';
import raw from 'raw-body';
import Stream from 'stream';
import URL from 'url';
import { HttpTrafficService } from '../services';

export const endPoint = (httpTrafficService: HttpTrafficService) => {
  return async (ctx, next) => {
    if (ctx.ignore) {
      await next();
      return;
    }
    const { userID } = ctx;
    const urlObj = URL.parse(ctx.req.url);
    const requestID = httpTrafficService.getRequestId(userID, urlObj);
    if (requestID > 0 && httpTrafficService.hasMonitor(userID)) {
      ctx.requestID = requestID;
      await httpTrafficService.requestBegin({
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
    if (requestID > 0 && httpTrafficService.hasMonitor(userID)) {
      const { res, remoteRequestBeginTime, remoteResponseStartTime } = ctx;
      const requestEndTime = Date.now();
      const { statusCode } = res;
      const headers = res._headers;
      getResponseBody(res).then(body => {
        httpTrafficService.serverReturn({
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
  };
};

export const actualRequest = (httpTrafficService: HttpTrafficService) => {
  return async (ctx, next) => {
    if (ctx.ignore) {
      await next();
      return;
    }
    const { userID, requestID } = ctx;
    if (requestID > 0 && httpTrafficService.hasMonitor(userID)) {
      const url = URL.parse(ctx.req.url);
      const { headers, method, httpVersion } = ctx.req;
      getRequestBody(ctx.req).then(body => {
        httpTrafficService.actualRequest({
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
  };
};

const getRequestBody = async req => {
  if (req.body) {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve, reject) => {
    raw(inflate(req), 'utf-8', (err, body) => {
      if (err) {
        return reject(err);
      } else {
        return resolve(body);
      }
    });
  });
};

const getResponseBody = async res => {
  const { body } = res;
  if (!body) {
    return Promise.resolve('');
  }
  if (Buffer.isBuffer(body)) {
    return Promise.resolve(body.toString('utf-8'));
  }
  if ('string' === typeof body) {
    return Promise.resolve(body);
  }
  if (body instanceof Stream) {
    return new Promise((resolve, reject) => {
      raw(inflate(body), 'utf-8', (err, text) => {
        if (err) {
          return reject(err);
        } else {
          return resolve(text);
        }
      });
    });
  }
};
