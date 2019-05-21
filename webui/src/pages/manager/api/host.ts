/**
 * Created by tsxuehu on 17/1/9.
 */
import axios from 'axios';
import _ from 'lodash';

/**
 * 创建规则文件
 */
export function createFile(name: string, description: string) {
  return axios.post('/host/create', {
    name: name,
    description: description,
  });
}

/**
 * 获取规则文件列表
 */
export function getFileList() {
  return axios.get('/host/filelist');
}

export function deleteFile(name: string) {
  return axios.get(`/host/deletefile?name=${name}`);
}

export function toggleFile(name: string) {
  return axios.get(`/host/togglefile?name=${name}`);
}

export function getFileContent(name: string) {
  return axios.get(`/host/getfile?name=${name}`);
}

export function saveFile(name: string, content: any) {
  return axios.post(`/host/savefile?name=${name}`, content);
}

export function importRemote(url: string) {
  return axios.get(`/host/import?url=${encodeURIComponent(url)}`);
}

export const debouncedUseFile = _.debounce(function(name, callback) {
  toggleFile(name).then(response => {
    callback(response);
  });
}, 500);
