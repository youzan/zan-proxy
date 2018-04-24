import URL from 'url'
import { Middleware, HostService, ProfileConfigService, Request } from '../service'

export const hostMiddleware = (hostService: HostService, profileConfigService: ProfileConfigService): Middleware => next => async ctx => {
    const req: Request = ctx.req
    const preventHostResolve: boolean | undefined = ctx.preventHostResolve
    if (preventHostResolve) {
        return next(ctx)
    }
    const isHostEnabled = await profileConfigService.isHostEnabled()
    if (!isHostEnabled) {
        return next(ctx)
    }
    const url = URL.parse(req.url || '')
    url.hostname = await hostService.resolveHost(url.hostname || '')
    url.host = url.hostname
    if (url.port) {
        url.host = `${url.host}:${url.port}`
    }
    req.url = URL.format(url)
    return next(ctx)
}