import { Middleware } from '../service'

export const UserMidleware = (): Middleware => {
  return next => ctx => {
    // const factory: ContainerFactory = ctx.container.get(ContainerFactoryService)
    // const container = factory.get(ctx.clientIp)
    // if (!container) {
    //   ctx.res.statusCode = 404
    //   ctx.res.end()
    //   return false
    // }
    // ctx.container = container
    // return next(ctx)
    return next(ctx)
  }
}
