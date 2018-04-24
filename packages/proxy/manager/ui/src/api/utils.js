/**
 * Created by tsxuehu on 17/1/9.
 */

import axios from 'axios';
var api = {


  getRemoteRuleFile(url){
    return axios.get(`/utils/getGitlabFile?url=${encodeURIComponent(url)}`);
  }
};

export default api;
