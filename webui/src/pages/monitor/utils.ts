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

const sizes = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];

interface IPrettySizeOption {
  size: number;
  nospace?: boolean;
  one?: boolean;
  places?: number;
}

/**
 * Pretty print a size from bytes
 * @method pretty
 * @param {Number} size The number to pretty print
 * @param {Boolean} [nospace=false] Don't print a space
 * @param {Boolean} [one=false] Only print one character
 * @param {Number} [places=1] Number of decimal places to return
 */
export function prettySize({
  size,
  nospace = false,
  one = false,
  places = 1,
}: IPrettySizeOption) {
  let mysize;

  sizes.forEach((unit, id) => {
    if (one) {
      unit = unit.slice(0, 1);
    }
    const s = Math.pow(1024, id);
    let fixed;
    if (size >= s) {
      fixed = String((size / s).toFixed(places));
      if (fixed.indexOf('.0') === fixed.length - 2) {
        fixed = fixed.slice(0, -2);
      }
      mysize = fixed + (nospace ? '' : ' ') + unit;
    }
  });

  // zero handling
  // always prints in Bytes
  if (!mysize) {
    const unit = one ? sizes[0].slice(0, 1) : sizes[0];
    mysize = '0' + (nospace ? '' : ' ') + unit;
  }

  return mysize;
}
