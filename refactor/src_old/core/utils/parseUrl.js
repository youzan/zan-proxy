
/**
 * 从request里解析出url
 * {
  protocol: 'https:',
  slashes: true,
  auth: null,
  host: 'www.youzan.com',
  port: null,
  hostname: 'www.youzan.com',
  hash: null,
  search: '?b=2',
  query: 'b=2',
  pathname: '/aa',
  path: '/aa?b=2',
  href: 'https://www.youzan.com/aa?b=2' }
 */
const url = require('url');

module.exports =  function parseUrl(req) {
    let host = req.headers.host;
    let protocol = '';
    if (!req.connection.encrypted) {
        // http协议接收到请求,如果没有指明使用https协议代理访问则使用http
        if (/^https:/.test(req.url)) {
            protocol = "https";
        } else {
            protocol = "http";
        }
    } else {
        // https协议接收到请求,如果没有指明使用http协议代理访问则使用https
        if (!/^http:/.test(req.url)) {
            protocol = "https";
        } else {
            protocol = "http";
        }
    }
    let fullUrl = "";
    // 没有指明详细的url，则拼接url
    if (req.url.startsWith('http')){
        fullUrl = req.url;
    } else {
        fullUrl = protocol + '://' + host + req.url;
    }

    let urlObj = url.parse(fullUrl);
    urlObj.port = urlObj.port || (protocol == 'https' ? 443 : 80);

    return urlObj;
}
