/**
 * Created by tsxuehu on 17/1/9.
 */
import axios from 'axios';

export function saveFile(content: any) {
  return axios.post('/profile/savefile', content);
}

export function disableRule() {
  return axios.post(`/profile/setRuleState`);
}

export function enableRule() {
  return axios.post(`/profile/setRuleState?rulestate=1`);
}

export function disableHost() {
  return axios.post(`/profile/setHostState`);
}

export function enableHost() {
  return axios.post(`/profile/setHostState?hoststate=1`);
}
