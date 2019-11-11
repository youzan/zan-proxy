import axios from 'axios';

export async function getResponseBody(id: number) {
  const result = await axios.get(`/traffic/getResponseBody?id=${id}`);
  return result.data;
}

export async function getRequestBody(id: number) {
  const result = await axios.get(`/traffic/getRequestBody?id=${id}`);
  return result.data;
}

export async function clear() {
  const result = await axios.post('/traffic/clear');
  return result.data;
}
