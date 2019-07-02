import axios from 'axios';

/**
 * 保存变量配置
 */
export function saveProjectPath(content: any) {
  return axios.post('/profile/project-path', content);
}

/**
 * 启用或禁用转发规则
 */
export function toggleRule(enable: boolean) {
  return axios.post(`/profile/rule/enable`, {
    enable,
  });
}

/**
 * 启用或禁用host规则
 */
export function toggleHost(enable: boolean) {
  return axios.post(`/profile/host/enable`, {
    enable
  });
}
