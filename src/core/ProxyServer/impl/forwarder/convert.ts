import URL from 'url';

export default function(req) {
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
