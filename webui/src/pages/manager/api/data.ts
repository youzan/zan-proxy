import axios from 'axios';

export function getDataList() {
  return axios.get('/mock/list');
}

export function saveDataList(content: any) {
  return axios.post('/mock/list', content);
}

export function getDataFile(id: string) {
  return axios.get(`/mock/data?id=${id}`);
}

export function saveDataFile(id: string, content: any) {
  return axios.post(`/mock/data?id=${id}`, { content });
}
