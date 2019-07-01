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
export function getFileList() {
  return axios.get('/rule/filelist');
}

export function deleteFile(name: string) {
  return axios.get(`/rule/deletefile?name=${encodeURIComponent(name)}`);
}

export function setFileCheckStatus(name: string, checked: boolean) {
  return axios.get(`/rule/setfilecheckstatus?name=${name}&checked=${checked ? 1 : 0}`);
}

export function getFileContent(name: string) {
  return axios.get(`/rule/getfile?name=${name}`);
}

export function saveFile(name: string, content: any) {
  return axios.post(`/rule/savefile?name=${name}`, content);
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
  return axios.post(`/rule/updatefileinfo/${encodeURIComponent(originName)}`, {
    name,
    description,
  });
}

export function testRule(content: any) {
  return axios.post('/rule/test', content);
}

export function getRemoteRuleFile(url: string) {
  return axios.get(`/utils/getGitlabFile?url=${encodeURIComponent(url)}`);
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
// 构造debounce函数
export const debouncedSaveFile = _.debounce(function(name, content, callback) {
  saveFile(name, content).then(response => {
    callback(response);
  });
}, 3000);
