/**
 * Created by tsxuehu on 17/1/9.
 */

import axios from 'axios';
var api = {


  getRemoteRuleFile(url){
    return axios.get(`/utils/download?url=${encodeURIComponent(url)}`);
  }
};

export default api;
