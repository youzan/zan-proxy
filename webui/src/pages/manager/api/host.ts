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
export function createFile(data: ICreateHostData) {
  return axios.post('/host/create', data);
}

/**
 * 获取规则文件列表
 */
export function getFileList() {
  return axios.get('/host/list');
}

export function deleteFile(name: string) {
  return axios.delete(`/host/delete`, {
    params: { name }
  });
}

export function toggleFile(name: string) {
  return axios.post(`/host/toggle`, {}, {
    params: { name }
  });
}

export function getFileContent(name: string) {
  return axios.get<IHostFile>(`/host/get`, {
    params: { name }
  });
}

export function saveFile(name: string, content: IHostFile) {
  return axios.post(`/host/save`, content, {
    params: { name }
  });
}

export function importRemote(url: string) {
  return axios.post('/host/import', { url });
}
