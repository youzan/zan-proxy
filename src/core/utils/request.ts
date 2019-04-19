import fetch, { RequestInit } from 'node-fetch';
import * as qs from 'querystring';
import { isPlainObject } from 'lodash';

// 默认3s超时
const DEFAULT_TIMEOUT = 3000;
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
 * 合并默认 header
 * @param {object} headers
 * @returns
 */
function computeHeaders(headers: object) {
  return Object.assign({}, DEFAULT_HEADER, headers);
}

/**
 * 基础网络请求封装
 */
export default {
  get(url: string, params?: object, options: RequestInit = {}) {
    return fetch(computeUrl(url, params), {
      method: 'GET',
      headers: computeHeaders(options.headers),
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
  },
  post(url: string, body?, params?: object, options: RequestInit = {}) {
    return fetch(computeUrl(url, params), {
      method: 'POST',
      body: isPlainObject(body) ? JSON.stringify(body) : body,
      headers: computeHeaders(options.headers),
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
  },
  put(url: string, body?, params?: object, options: RequestInit = {}) {
    return fetch(computeUrl(url, params), {
      method: 'PUT',
      body: isPlainObject(body) ? JSON.stringify(body) : body,
      headers: computeHeaders(options.headers),
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
  },
  del(url: string, params?: object, options: RequestInit = {}) {
    return fetch(computeUrl(url, params), {
      method: 'DELETE',
      headers: computeHeaders(options.headers),
      timeout: DEFAULT_TIMEOUT,
      ...options,
    });
  },
};
