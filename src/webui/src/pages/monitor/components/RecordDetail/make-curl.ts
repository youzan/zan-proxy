import { isArray, isObject } from 'lodash';
import shellEscape from 'shell-escape';

interface IMakeCurlOption {
  method: string;
  headers: any;
  body: any;
  href: string;
  auth: string;
}

export default function makeCurl({ method, headers, body, href, auth }: IMakeCurlOption) {
  const args = ['curl'];

  // method
  args.push('-X', method || 'GET');

  // username
  if (auth) {
    args.push('-u', auth);
  }

  // headers
  headers = headers || {};
  Object.keys(headers).forEach(k => {
    const v = headers[k];
    args.push('-H', v ? `${k}: ${v}` : `${k};`);
  });

  // body
  if (body) {
    if (isObject(body) || isArray(body)) {
      body = JSON.stringify(body);
    }
    args.push('--data', body);
  }

  // url
  args.push(href);

  return shellEscape(args);
}
