import http from 'http'
import net from 'net'
import { Token } from 'typedi';

export interface ConnectHandler {
  handle(req: http.IncomingMessage, socket: net.Socket, head: Buffer)
}

export const ConnectHandlerService = new Token<ConnectHandler>('ConnectHandler')

export interface HttpHandler {
  handle(req: http.IncomingMessage, res: http.ServerResponse)
}

export const HttpHandlerService = new Token<HttpHandler>('HttpHandler')
