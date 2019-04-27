const pairSplitRegExp = /; */;
const decode = decodeURIComponent;

function tryDecode(str: string, decode: (str: string) => string) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

export function parseCookie(str: string) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  const obj: { [key: string]: string } = {};
  const pairs = str.split(pairSplitRegExp);

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    let eqIdx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eqIdx < 0) {
      continue;
    }

    const key = pair.substr(0, eqIdx).trim();
    let val = pair.substr(++eqIdx, pair.length).trim();

    // quoted values
    if ('"' === val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined === obj[key]) {
      obj[key] = tryDecode(val, decode);
    }
  }

  return obj;
}

const contentTypeText: {
  [contentType: string]: string;
} = {
  html: 'Document',
  javascript: 'Script',
  css: 'Stylesheet',
  font: 'Font',
  json: 'JSON',
  png: 'PNG',
  jpg: 'JPEG',
  gif: 'GIF',
};

export function getContextTypeText(contentType: string) {
  if (contentType) {
    Object.keys(contentTypeText).forEach(k => {
      if (contentType.includes(k)) {
        return k;
      }
    });
  }

  return 'XHR';
}
