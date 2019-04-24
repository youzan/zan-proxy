import axios from 'axios';
import queryString from 'query-string';

export async function getResponseBody(id: number) {
  try {
    const result = await axios.get(`/traffic/getResponseBody?id=${id}`);
    return result.data;
  } catch (e) {
    return '';
  }
}

export async function getRequestBody(id: number) {
  try {
    const result = await axios.get(`/traffic/getRequestBody?id=${id}`);
    return result.data;
  } catch (e) {
    return '';
  }
}

export async function setStopRecord(stop: boolean) {
  try {
    const result = await axios.post('/traffic/stopRecord', { stop });
    return result.data;
  } catch (e) {
    return '';
  }
}

export async function clear() {
  try {
    const result = await axios.post('/traffic/clear');
    return result.data;
  } catch (e) {
    return '';
  }
}
export async function setFilter(filter: string) {
  try {
    const result = await axios.post('/traffic/setFilter', { filter });
    return result.data;
  } catch (e) {
    return '';
  }
}

const pairSplitRegExp = /; */;
const decode = decodeURIComponent;

function tryDecode(str: string, decode: (str: string) => string) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

export function parseCookie(str: string, options: { decode: (str: string) => string }) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  const obj: { [key: string]: string } = {};
  const opt = options || {};
  const pairs = str.split(pairSplitRegExp);
  const dec = opt.decode || decode;

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
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}
