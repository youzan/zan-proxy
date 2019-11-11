import { IHostFile } from '@core/types/host';
/**
 * Created by tsxuehu on 17/1/9.
 */
import axios from 'axios';
import _ from 'lodash';

export interface ICreateHostData {
  name: string;
  description: string;
}

/**
 * 创建规则文件
 */
export function createHost(data: ICreateHostData) {
  return axios.post('/host/create', data);
}

/**
 * 获取规则文件列表
 */
export function getRuleList() {
  return axios.get('/host/list');
}

export function deleteHost(name: string) {
  return axios.delete('/host/delete', {
    params: { name }
  });
}

export function toggleHost(name: string, enable: boolean) {
  return axios.post('/host/toggle', {
    name,
    enable,
  });
}

export function getHost(name: string) {
  return axios.get<IHostFile>('/host/get', {
    params: { name }
  });
}

export function saveHost(name: string, content: IHostFile) {
  return axios.post('/host/save', content, {
    params: { name }
  });
}

export function importRemoteHost(url: string) {
  return axios.post('/host/import', { url });
}
