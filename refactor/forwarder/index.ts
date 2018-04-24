import https from 'https'
import http from 'http'
import convert from './convert';
import AbstractForwarder from '../abstracts/forwarder';

class Forwarder extends AbstractForwarder{
    async forward(ctx): Promise<any> {
        return new Promise((resolve, reject) => {
            const { req, res } = ctx;
            if (!res.writable || res.finished || res.body) {
                return resolve(false);
            }
            const options = convert(req);
            let client: any = http;
            if (options.protocol && options.protocol.startsWith('https')) {
                client = https;
            }
            const proxyReq = client.request(options, proxyRes => {
                res.statusCode = proxyRes.statusCode;
                // Object.entries(proxyRes.headers).forEach(entry => {
                //     const [k, v] = entry;
                //     res.setHeader(k, v);
                // })
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

export default Forwarder;