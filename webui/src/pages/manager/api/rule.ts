import axios from 'axios';
import _ from 'lodash';
import { IRuleFile } from '@core/types/rule';

/**
 * 创建规则文件
 */
export function createFile(name: string, description: string) {
  return axios.post('/rule/create', {
    name: name,
    description: description,
  });
}

/**
 * 获取规则文件列表
 */
export function getRuleList() {
  return axios.get('/rule/list');
}

export function deleteRule(name: string) {
  return axios.delete(`/rule/delete?name=${encodeURIComponent(name)}`);
}

export function toggleRule(name: string, checked: boolean) {
  return axios.post(`/rule/toggle?name=${name}&checked=${checked ? 1 : 0}`);
}

export function getRuleContent(name: string) {
  return axios.get<IRuleFile>(`/rule/get?name=${name}`);
}

export function saveRule(name: string, content: any) {
  return axios.post(`/rule/save?name=${name}`, content);
}

/**
 * 修改规则集文件名
 */
export function updateFileInfo(
  originName: string,
  {
    name,
    description,
  }: {
    name: string;
    description: string;
  },
) {
  return axios.post(`/rule/update/info/${originName}`, {
    name,
    description,
  });
}

export function testRule(content: any) {
  return axios.post('/rule/test', content);
}

export function getReferenceVar(content: any) {
  var contentStr = JSON.stringify(content);
  var reg = RegExp('<%=(.+?)%>', 'g');
  var result;
  var varObj: any = {};
  while ((result = reg.exec(contentStr)) != null) {
    varObj[_.trim(result[1])] = 1;
  }
  return _.keys(varObj);
}

export function importRemote(url: string) {
  return axios.get(`/rule/import?url=${encodeURIComponent(url)}`);
}

export function copyFile(name: string) {
  return axios.get(`/rule/copy?name=${encodeURI(name)}`);
}
