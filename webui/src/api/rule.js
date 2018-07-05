/**
 * Created by tsxuehu on 17/1/9.
 */

import axios from 'axios';
import _ from 'lodash';
var api = {
  /**
   * 创建规则文件
   */
  createFile(name, description){
    return axios.post('/rule/create', {
      name: name,
      description: description
    });
  },
  /**
   * 获取规则文件列表
   */
  getFileList(){
    return axios.get('/rule/filelist');
  },
  deleteFile(name){
    return axios.get(`/rule/deletefile?name=${encodeURIComponent(name)}`);
  },
  setFileCheckStatus(name, checked){
    return axios.get(`/rule/setfilecheckstatus?name=${name}&checked=${checked ? 1 : 0}`);
  },
  getFileContent(name){
    return axios.get(`/rule/getfile?name=${name}`);
  },
  saveFile(name, content){
    return axios.post(`/rule/savefile?name=${name}`, content);
  },

  /**
   * 修改规则集文件名
   * @param {String} origin 原名称
   * @param {String} name 新名称
   * @param {String} description 新描述
   */
  updateFileInfo(origin, { name, description }) {
    return axios.post(`/rule/updatefileinfo/${encodeURIComponent(origin)}`, { name, description });
  },

  testRule(content){
    return axios.post('/rule/test', content);
  },

  getRemoteRuleFile(url){
    return axios.get(`/utils/getGitlabFile?url=${encodeURIComponent(url)}`);
  },

  getReferenceVar(content) {
    var contentStr = JSON.stringify(content);
    var reg = RegExp("<%=(.+?)%>", 'g');
    var result;
    var varObj = {};
    while ((result = reg.exec(contentStr)) != null) {
      varObj[_.trim(result[1])] = 1;
    }
    return _.keys(varObj);
  },

  importRemote(url) {
    return axios.get(`/rule/import?url=${encodeURIComponent(url)}`)
  },

  copyFile(name) {
    return axios.get(`/rule/copy?name=${encodeURI(name)}`);
  },

  setFileDisableSync(name, disable) {
    return axios.get(`/rule/setfiledisablesync?name=${name}&disable=${disable ? 1 : 0}`)
  },

};

// 构造debounce函数
api.debouncedSaveFile = _.debounce(function (name, content, callback) {
    api.saveFile(name, content).then((response) => {
        callback(response)
    });
}, 3000);
export default api;
