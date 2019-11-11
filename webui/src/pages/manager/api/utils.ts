import axios from 'axios';

export function getIp() {
  return axios.get<string>('/utils/ip', {
    responseType: 'text',
  });
}
