import http from 'http';
import net from 'net';

import { middleware } from '../middleware';

export interface UpgradeHandler {
  handle(req: http.IncomingMessage, socket: net.Socket, head: Buffer);
  setMiddleware(m: middleware);
}
