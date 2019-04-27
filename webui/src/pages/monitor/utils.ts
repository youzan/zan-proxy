import { find as _find, isArray, isObject } from 'lodash';
import shellEscape from 'shell-escape';

const CONTENT_TYPE_MAP: {
  [contentType: string]: string;
} = {
  html: 'Document',
  javascript: 'Script',
  css: 'Stylesheet',
  font: 'Font',
  json: 'Json',
  png: 'Image',
  jpg: 'Image',
  jpeg: 'Image',
  gif: 'Image',
  audio: 'Audio',
  video: 'Video'
};

export function getContextTypeText(contentType: string) {
  if (!contentType) {
    return '';
  }

  const matchResult = _find(CONTENT_TYPE_MAP, (v, key) => contentType.includes(key));
  return matchResult ? matchResult : 'XHR';
}


interface IMakeCurlOption {
  method: string;
  headers: any;
  body: any;
  href: string;
  auth: string;
}

export function makeCurl({ method, headers, body, href, auth }: IMakeCurlOption) {
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
