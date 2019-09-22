import { isPlainObject } from 'lodash';
import fetch, { RequestInit } from 'node-fetch';
import * as qs from 'querystring';

// 默认3s超时
const DEFAULT_TIMEOUT = 3000;

const DEFAULT_GET_HEADER = {};
const DEFAULT_HEADER = {
  'Content-Type': 'application/json',
};

/**
 * 拼接 queryString 到 url
 * @param {string} url
 * @param {object} [params]
 * @returns
 */
function computeUrl(url: string, params?: object) {
  return params ? `${url}?${qs.stringify(params)}` : url;
}

/**
 * 基础网络请求封装
 */
export default {
  get(url: string, params?: object, options: RequestInit = {}) {
    return fetch(computeUrl(url, params), {
      method: 'GET',
      headers: Object.assign({}, DEFAULT_GET_HEADER, options.headers),
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
  },
  post(url: string, body?, params?: object, options: RequestInit = {}) {
    return fetch(computeUrl(url, params), {
      method: 'POST',
      body: isPlainObject(body) ? JSON.stringify(body) : body,
      headers: Object.assign({}, DEFAULT_HEADER, options.headers),
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
  },
  put(url: string, body?, params?: object, options: RequestInit = {}) {
    return fetch(computeUrl(url, params), {
      method: 'PUT',
      body: isPlainObject(body) ? JSON.stringify(body) : body,
      headers: Object.assign({}, DEFAULT_HEADER, options.headers),
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
  },
  del(url: string, params?: object, options: RequestInit = {}) {
    return fetch(computeUrl(url, params), {
      method: 'DELETE',
      headers: Object.assign({}, DEFAULT_HEADER, options.headers),
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
  },
};
