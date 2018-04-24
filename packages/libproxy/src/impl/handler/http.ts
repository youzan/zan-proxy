import { Inject, Service } from 'typedi'
import Stream from 'stream'
import { HttpHandler as IHttpHandler, HttpHandlerService, MiddlewareComposer, MiddlewareComposerToken, Context } from '../../service'

@Service({
    global: true,
    id: HttpHandlerService
})
export class HttpHandler implements IHttpHandler {
    @Inject(MiddlewareComposerToken) composer: MiddlewareComposer
    async handle(req, res) {
        const context: Context = {
           req,
           res
        }
        await this.composer.getComposed()(context)
        if (!res.writable || res.finished) {
          return false
        }
        const {
          body
        } = res
        if (Buffer.isBuffer(body)) return res.end(body)
        if ('string' == typeof body) return res.end(body)
        if (body instanceof Stream) return body.pipe(res)
        return res.end(JSON.stringify(body))
    }
}