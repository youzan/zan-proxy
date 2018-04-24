import { IncomingMessage } from 'http'
import { Middleware } from '../service'

export const IPMiddleware = (): Middleware => {
  return next => async ctx => {
    const req: IncomingMessage = ctx.req
    const ip =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress
    ctx.clientIP = ip
    await next(ctx)
  }
}
