import { IProxyContext, IProxyMiddleware } from '@core/types/proxy';
import { supportBrotli } from '@core/utils';
import http from 'http';
import https, { RequestOptions } from 'https';
import { isNull, isUndefined } from 'lodash';
import { Service } from 'typedi';
import URL from 'url';

@Service()
export class ForwarderMiddleware implements IProxyMiddleware {
  private getRequestOptions(req: http.IncomingMessage): RequestOptions {
    const url = URL.parse(req.url as string);
    const isHttps = url.protocol && url.protocol.startsWith('https');
    const port = url.port || (isHttps ? 443 : 80);
    let headers = req.headers;
    const encoding = headers['accept-encoding'] as string;
    // decode暂不支持 brolti 算法
    if (encoding && /br/.test(encoding)) {
      headers = Object.assign({}, headers, {
        'accept-encoding': 'gzip, deflate',
      });
    }
    return {
      auth: url.auth,
      headers,
      host: url.host,
      hostname: url.hostname,
      method: req.method,
      path: url.path,
      port,
      protocol: url.protocol,
      rejectUnauthorized: false,
    };
  }

  public async middleware(ctx: IProxyContext) {
    return new Promise<void>((resolve, reject) => {
      const { req, res } = ctx;
      if (!res.writable || res.finished || !(isUndefined(res.body) || isNull(res.body))) {
        return resolve();
      }

      const options = this.getRequestOptions(req);
      const client = options.protocol && options.protocol.startsWith('https') ? https : http;

      // fix request headers
      // 插件修改 req.body 后，以插件提供的 body 为请求体内容，重新设置 content-length header
      if (req.body && req.body.length) {
        options.headers && (options.headers['content-length'] = req.body.length);
      }

      // create real request
      const proxyReq = client.request(options, proxyRes => {
        res.statusCode = proxyRes.statusCode as number;
        Object.keys(proxyRes.headers).forEach(headerName => {
          // @ts-ignore
          res.setHeader(headerName, proxyRes.headers[headerName]);
        });
        ctx.res.body = proxyRes;
        return resolve();
      });

      // send client request body
      if (req.body) {
        proxyReq.end(req.body);
      } else {
        req.pipe(proxyReq);
      }
      proxyReq.on('error', e => reject(e));
    });
  }
}
