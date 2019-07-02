import URL from 'url';

export default function(req) {
  const url = URL.parse(req.url);
  const isHttps = url.protocol && url.protocol.startsWith('https');
  const port = url.port || (isHttps ? 443 : 80);
  let headers = req.headers;
  const encoding = headers['accept-encoding'];
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
