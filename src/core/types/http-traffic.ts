import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';

import { ICtxTimeTrack } from './proxy';

export interface ITrafficStatus {
  overflow: boolean;
}

export interface ITrafficRequest {
  originUrl: string;
  actualUrl: string;
  headers: IncomingHttpHeaders;
  clientIp: string;
  httpVersion: string;
  method: string;
}

export interface ITrafficResponse {
  statusCode: number;
  headers: OutgoingHttpHeaders;
  timeTrack: ICtxTimeTrack;
}

export type ITrafficRecord<KEY extends string, DATA_TYPE> = {
  id: number;
} & Record<KEY, DATA_TYPE>;

export interface IRecord {
  id: number;
  request?: ITrafficRequest;
  response?: ITrafficResponse;
}
