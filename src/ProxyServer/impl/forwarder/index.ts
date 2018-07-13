import http from 'http';
import https from 'https';
import { isNull, isUndefined } from 'lodash';
import { Forwarder as IForwarder } from '../../interfaces';
import convert from './convert';

export class Forwarder implements IForwarder {
  public async forward(ctx): Promise<any> {
    return new Promise((resolve, reject) => {
      const { req, res } = ctx;
      if (
        !res.writable ||
        res.finished ||
        !(isUndefined(res.body) || isNull(res.body))
      ) {
        return resolve(false);
      }
      const options = convert(req);
      let client: any = http;
      if (options.protocol && options.protocol.startsWith('https')) {
        client = https;
      }
      if (req.body && req.body.length) {
        options.headers['content-length'] = req.body.length;
      }
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
