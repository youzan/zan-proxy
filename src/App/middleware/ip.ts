import { IncomingMessage } from 'http';

export const ip = () => {
  return async (ctx, next) => {
    if (ctx.ignore) {
      await next();
      return;
    }
    const req: IncomingMessage = ctx.req;
    ctx.clientIP =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress;
    await next();
  };
};
