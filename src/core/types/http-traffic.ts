import { UrlWithStringQuery } from 'url';

export type ITrafficOriginRequest = UrlWithStringQuery & {
  headers: object;
  clientIp: string;
  method: string;
  httpVersion: string;
};

export interface ITrafficRequestData {
  headers: object;
  httpVersion: string;
  method: string;
  path: string;
  port: number;
  protocol: string;
  body: any;
}

export interface ITrafficResponse {
  headers: object;
  receiveRequestTime: number;
  remoteIp: string;
  remoteRequestBeginTime: number;
  remoteResponseEndTime: number;
  remoteResponseStartTime: number;
  requestEndTime: number;
  statusCode: number;
}

export type ITrafficRecord<KEY extends string, DATA_TYPE> = {
  id: number;
} & Record<KEY, DATA_TYPE>;

export type IRecord =
  | ITrafficRecord<'originRequest', ITrafficOriginRequest>
  | ITrafficRecord<'requestData', ITrafficRequestData>
  | ITrafficRecord<'response', ITrafficResponse>;
