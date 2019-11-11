import http from 'http';
import URL from 'url';

type ISupportProtocal = 'http' | 'https' | 'ws' | 'wss';

/**
 * 本地服务器收到的 req.url 只有 path 部分，需要使用 host header 来补全实际的访问 url
 */
export function fillReqUrl(req: http.IncomingMessage, protocal: ISupportProtocal = 'http') {
  const reqUrlObj = URL.parse(req.url as string);
  const host = req.headers.host;
  reqUrlObj.host = host;
  reqUrlObj.protocol = protocal;
  let urlStr = URL.format(reqUrlObj);
  // 兼容 ws、wss，因为 URL.format 不会给除 http 和 https 以外的协议添加双斜杠
  if (protocal.includes('ws')) {
    urlStr = urlStr.replace(/(wss?:)/, '$1//');
  }
  req._proxyOriginUrl = urlStr;
  req.url = urlStr;
}
