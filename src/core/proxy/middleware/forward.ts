import http from 'http';
import https, { RequestOptions } from 'https';
import { isNil } from 'lodash';
import ProxyAgent from 'proxy-agent';
import { Inject, Service } from 'typedi';
import URL from 'url';

import { ProfileService } from '@core/services';
import { IProxyContext, IProxyMiddleware } from '@core/types/proxy';
import isSupportBrotli from '@core/utils/supports-brotli';

@Service()
export class ForwarderMiddleware implements IProxyMiddleware {
  @Inject() private profileService: ProfileService;

  private getRequestOptions(req: http.IncomingMessage): RequestOptions {
    const url = URL.parse(req.url as string);
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

  private fixRequestHeaders(req: http.IncomingMessage, options: http.RequestOptions) {
    // fix request headers
    // 插件修改 req.body 后，以插件提供的 body 为请求体内容，重新设置 content-length header
    if (req.body && req.body.length) {
      options.headers && (options.headers['content-length'] = req.body.length);
    }

    // node version under v11.7.0, not support brotli algorithm
    if (!isSupportBrotli && options.headers && options.headers['accept-encoding']) {
      const accpetEncoding = options.headers['accept-encoding'] as string;
      accpetEncoding
        .split(',')
        .map(encoding => encoding.trim())
        .filter(encoding => encoding !== 'br')
        .join(', ');
    }
  }

  private addProxyAgent(options: http.RequestOptions) {
    const customProxy = this.profileService.customProxy;
    if (customProxy) {
      // @ts-ignore
      options.agent = new ProxyAgent(customProxy);
    }
  }

  public async middleware(ctx: IProxyContext) {
    return new Promise<void>((resolve, reject) => {
      const { req, res } = ctx;
      if (!res.writable || res.finished || !isNil(res.body)) {
        return resolve();
      }

      const options = this.getRequestOptions(req);
      const client = options.protocol && options.protocol.startsWith('https') ? https : http;

      this.fixRequestHeaders(req, options);
      this.addProxyAgent(options);

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
