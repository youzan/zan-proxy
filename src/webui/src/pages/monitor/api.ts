import axios from 'axios';

export async function getResponseBody(id: number) {
  try {
    const result = await axios.get(`/traffic/getResponseBody?id=${id}`);
    return result.data;
  } catch (e) {
    return '';
  }
}

export async function getRequestBody(id: number) {
  try {
    const result = await axios.get(`/traffic/getRequestBody?id=${id}`);
    return result.data;
  } catch (e) {
    return '';
  }
}

export async function clear() {
  try {
    const result = await axios.post('/traffic/clear');
    return result.data;
  } catch (e) {
    return '';
  }
}
