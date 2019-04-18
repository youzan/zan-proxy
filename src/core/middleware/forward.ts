import http from 'http';
import https, { RequestOptions } from 'https';
import { isNull, isUndefined } from 'lodash';
import { Service } from 'typedi';
import URL from 'url';

import { IProxyContext, IProxyMiddleware, NextFunction } from '@core/types/proxy';

function convert(req: http.IncomingMessage): RequestOptions {
  const url = URL.parse(req.url);
  const isHttps = url.protocol && url.protocol.startsWith('https');
  const port = url.port || (isHttps ? 443 : 80);
  return {
    auth: url.auth,
    headers: req.headers,
    host: url.host,
    hostname: url.hostname,
    method: req.method,
    path: url.path,
    port,
    protocol: url.protocol,
    rejectUnauthorized: false,
  };
}

@Service()
export class ForwarderMiddleware implements IProxyMiddleware {
  public async middleware(ctx: IProxyContext) {
    return new Promise((resolve, reject) => {
      const { req, res } = ctx;
      if (!res.writable || res.finished || !(isUndefined(res.body) || isNull(res.body))) {
        return resolve(false);
      }
      const options = convert(req);
      const client = options.protocol && options.protocol.startsWith('https') ? https : http;
      if (req.body && req.body.length) {
        options.headers['content-length'] = req.body.length;
      }
      // decode暂不支持 brolti 算法
      options.headers['accept-encoding'] = 'gzip, deflate';
      const proxyReq = client.request(options, proxyRes => {
        res.statusCode = proxyRes.statusCode;
        Object.keys(proxyRes.headers).forEach(k => {
          const v = proxyRes.headers[k];
          res.setHeader(k, v);
        });
        ctx.res.body = proxyRes;
        return resolve(proxyRes);
      });
      if (req.body) {
        proxyReq.end(req.body);
      } else {
        req.pipe(proxyReq);
      }
      proxyReq.on('error', e => reject(e));
    });
  }
}
