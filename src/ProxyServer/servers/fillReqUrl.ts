import URL from 'url';

const fillReqURL = (req, protocal = 'http') => {
  const url = URL.parse(req.url);
  const host = req.headers.host;
  url.host = host;
  url.protocol = protocal;
  let urlStr = URL.format(url);
  // 兼容 ws, wss
  if (protocal.includes('ws')) {
    urlStr = urlStr.replace(/(wss?:)/, '$1//');
  }
  req.url = urlStr;
};

export default fillReqURL;
