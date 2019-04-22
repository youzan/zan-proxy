import http from 'http';

export type NextFunction = () => Promise<void>;

declare module 'http' {
  interface IncomingMessage {
    body: any;
  }

  interface ServerResponse {
    body: any;
  }
}

export interface IProxyContext {
  req: http.IncomingMessage;
  res: http.ServerResponse;

  // middleware append properties
  ignore: boolean;
  requestID: number;
  remoteRequestBeginTime: number;
  remoteResponseStartTime: number;
}

export type IProxyMiddlewareFn = (ctx: IProxyContext, next?: NextFunction) => Promise<any>;

export interface IProxyMiddleware {
  onInit?: () => void;
  middleware: IProxyMiddlewareFn;
}
