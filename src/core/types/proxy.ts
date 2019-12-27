import http from 'http';

export type NextFunction = () => Promise<void>;

declare module 'http' {
  interface IncomingMessage {
    body: any;
    _proxyOriginUrl: string;
  }

  interface ServerResponse {
    body: any;
  }
}

export interface ICtxTimeTrack {
  receiveRequest: number;
  sendRemoteRequest: number;
  receiveRemoteResponse: number;
  finishRequest: number;
}

export interface IProxyContext {
  req: http.IncomingMessage;
  res: http.ServerResponse;

  // middleware append properties
  ignore: boolean;
  trafficId: number;
  timeTrack: ICtxTimeTrack;
}

export type IProxyMiddlewareFn = (ctx: IProxyContext, next?: NextFunction) => Promise<any>;

export interface IProxyMiddleware {
  onInit?: () => void;
  middleware: IProxyMiddlewareFn;
}
