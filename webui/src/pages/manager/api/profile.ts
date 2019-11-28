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
  return axios.post(`/profile/rule/toggle`, {
    enable,
  });
}

/**
 * 启用或禁用host规则
 */
export function toggleHost(enable: boolean) {
  return axios.post(`/profile/host/toggle`, {
    enable,
  });
}

/**
 * 设置自定义二次代理服务器
 */
export function setCustomProxy(customProxy: string) {
  return axios.post(`/profile/custom-proxy`, {
    customProxy,
  });
}
