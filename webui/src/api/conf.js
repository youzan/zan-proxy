/**
 * Created by tsxuehu on 17/1/9.
 */

import axios from 'axios';
export default {
  saveFile(content){
    return axios.post('/configure/savefile', content);
  }
}
