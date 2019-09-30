import { IRuleFile, IRuleTest } from '@core/types/rule';
import axios from 'axios';
import _ from 'lodash';

/**
 * 创建规则文件
 */
export function createRule(name: string, description: string) {
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
  return axios.delete('/rule/delete', {
    params: { name },
  });
}

export function toggleRule(name: string, enable: boolean) {
  return axios.post('/rule/toggle', {
    name,
    enable,
  });
}

export function getRuleContent(name: string) {
  return axios.get<IRuleFile>('/rule/get', {
    params: { name },
  });
}

export function saveRule(name: string, content: any) {
  return axios.post('/rule/save', content, {
    params: { name },
  });
}

/**
 * 修改规则集文件名
 */
export function updateRuleInfo(
  originName: string,
  updateInfo: {
    name: string;
    description: string;
  },
) {
  return axios.post('/rule/update/info', {
    originName,
    updateInfo
  });
}

export function testRule(content: IRuleTest) {
  return axios.post('/rule/test', content);
}

export function importRemoteRule(url: string) {
  return axios.post('/rule/import', { url });
}

export function copyRule(name: string) {
  return axios.post('/rule/copy', { name });
}
