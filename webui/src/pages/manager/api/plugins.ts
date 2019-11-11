import axios from 'axios';

interface IPluginApiCommonReq {
  name: string;
}

export interface IAddPluginReq extends IPluginApiCommonReq {
  registry: string;
}

export function addPlugin(data: IAddPluginReq) {
  return axios.post<void>('/plugins/add', data);
}

export function updatePlugin(data: IPluginApiCommonReq) {
  return axios.post<void>('/plugins/update', data);
}

export function removePlugin(data: IPluginApiCommonReq) {
  return axios.post<void>('/plugins/remove', data);
}

export interface ITogglePluginReq extends IPluginApiCommonReq {
  disabled: boolean;
}

export function togglePlugin(data: ITogglePluginReq) {
  return axios.post('/plugins/toggle', data);
}
