import axios from "axios";
import queryString from "query-string";
export async function getResponseBody(id) {
  try{
    let result = await axios.get(`/traffic/getResponseBody?id=${id}`);
    return result.data;
  }catch (e){
    return '';
  }

}
export async function getRequestBody(id) {
  try{
    let result = await axios.get(`/traffic/getRequestBody?id=${id}`);
    return result.data;
  }catch (e){
    return '';
  }

}

export async function setStopRecord(stop) {
    try{
        let result = await axios.get(`/traffic/stopRecord?stop=${stop}`);
        return result.data;
    }catch (e){
        return '';
    }
}

export async function clear() {
    try{
        let result = await axios.get('/traffic/clear');
        return result.data;
    }catch (e){
        return '';
    }
}
export async function setFilter(filter) {
    try{
        let result = await axios.get(`/traffic/setfilter?filter=${filter}`);
        return result.data;
    }catch (e){
        return '';
    }
}


let pairSplitRegExp = /; */;
let decode = decodeURIComponent;

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

export function parseCookie(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {}
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim()
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

export function parseQuery(path) {
  if (!path || path.indexOf('?') < 0) return {};

  return queryString.parse(path.split('?')[1]);
}
