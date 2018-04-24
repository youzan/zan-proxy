import URL from 'url';

export default function(req) {
    const url = URL.parse(req.url)
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