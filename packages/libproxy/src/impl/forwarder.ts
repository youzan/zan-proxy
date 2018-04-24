import URL from 'url';
import http from 'http'
import https from 'https'
import { Service } from 'typedi'
import { IForwarderService, IForwarder } from '../service';

function convert(req: http.IncomingMessage) {
    const url = URL.parse(req.url || '')
    let port = url.port || 80;
    if (url.protocol && url.protocol.startsWith('https')) {
        port = 443;
    }
    return {
        protocol: url.protocol,
        hostname: url.hostname,
        host: url.host,
        port: port,
        method: req.method,
        path: url.path,
        headers: req.headers,
        auth: url.auth,
        rejectUnauthorized: false
    };
}

@Service({
  id: IForwarderService
})
class Forwarder implements IForwarder {
  async forward(ctx): Promise<any> {
    return new Promise((resolve, reject) => {
        const { req, res } = ctx;
        if (!res.writable || res.finished || res.body) {
            return resolve(res);
        }
        const options = convert(req);
        let client: any = http;
        if (options.protocol && options.protocol.startsWith('https')) {
            client = https;
        }
        const proxyReq = client.request(options, proxyRes => {
            res.statusCode = proxyRes.statusCode;
            for (let k in proxyRes.headers) {
                const v = proxyRes.headers[k]
                res.setHeader(k, v)
            }
            ctx.res.body = proxyRes;
            return resolve(proxyRes)
        });
        if (req.body) {
            proxyReq.end(req.body);
        } else {
            req.pipe(proxyReq);
        }
        proxyReq.on('error', e => reject(e));
    })
  }
}

export default Forwarder

