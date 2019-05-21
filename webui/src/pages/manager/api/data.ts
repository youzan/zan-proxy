import axios from 'axios';
import uuidV4 from 'uuid/v4';

export function getDataList() {
  return axios.get('/data/getdatalist');
}

export function saveDataList(content: any) {
  return axios.post('/data/savedatalist', content);
}

// 获取版本数据
export function getDataFile(id: string) {
  return axios.get(`/data/getdatafile?id=${id}`);
}

// 保存版本数据
export function saveDataFile(id: string, content: any) {
  // var data = new FormData();
  // data.append('content', content);
  return axios.post(`/data/savedatafile?id=${id}`, { content });
}
//
export function saveDataEntryFromTraffic(reqId: string, name: string, contenttype: string) {
  return axios.post('/data/savedatafromtraffic', {
    id: uuidV4(),
    name: name,
    contenttype: contenttype,
    reqid: reqId,
  });
}
