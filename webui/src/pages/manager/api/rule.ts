import { IRuleFile, IRuleTest } from '@core/types/rule';
import axios from 'axios';
import _ from 'lodash';

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
  return axios.delete(`/rule/delete`, {
    params: { name },
  });
}

export function toggleRule(name: string, checked: boolean) {
  return axios.post('/rule/toggle', {
    name,
    checked,
  });
}

export function getRuleContent(name: string) {
  return axios.get<IRuleFile>(`/rule/get`, {
    params: { name },
  });
}

export function updateRule(name: string, content: any) {
  return axios.post(`/rule/update`, content, {
    params: { name },
  });
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

export function testRule(content: IRuleTest) {
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
  return axios.post('/rule/import', { url });
}

export function copyFile(name: string) {
  return axios.post('/rule/copy', { name });
}
