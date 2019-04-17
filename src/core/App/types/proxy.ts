import http from 'http';
import net from 'net';

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
  head: Buffer;
  req: http.IncomingMessage;
  res: http.ServerResponse;
  socket: net.Socket;

  // middleware append properties
  ignore: boolean;
  clientIP: string;
  userID: string;
  requestID: number;
  remoteRequestBeginTime: number;
  remoteResponseStartTime: number;
}

export type IProxyMiddlewareFn = (ctx: IProxyContext, next: NextFunction) => Promise<any>;

export interface IProxyMiddleware {
  onInit?: () => void;
  middleware: IProxyMiddlewareFn;
}
