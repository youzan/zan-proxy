/**
 * Created by tsxuehu on 17/1/9.
 */
import axios from 'axios';
import _ from 'lodash';
import { IHostFile } from '@core/types/host';

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
  return axios.delete(`/host/delete?name=${name}`);
}

export function toggleFile(name: string) {
  return axios.post(`/host/togglefile?name=${name}`);
}

export function getFileContent(name: string) {
  return axios.get<IHostFile>(`/host/get?name=${name}`);
}

export function saveFile(name: string, content: any) {
  return axios.post(`/host/save?name=${name}`, content);
}

export function importRemote(url: string) {
  return axios.post(`/host/import?url=${encodeURIComponent(url)}`);
}

export const debouncedUseFile = _.debounce(function(name, callback) {
  toggleFile(name).then(response => {
    callback(response);
  });
}, 500);
