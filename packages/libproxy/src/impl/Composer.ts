import { noop } from 'lodash'
import { Service } from 'typedi'
import { MiddlewareComposer as IMiddlewareComposer, MiddlewareComposerToken, Middleware, ContextHandler } from './../service'

@Service({
    global: true,
    id: MiddlewareComposerToken
})
export class MiddlewareComposer implements IMiddlewareComposer {
    private middlewares: Array <Middleware> = []
    private composed: ContextHandler | null = null
    add(middleware:Middleware) {
        this.middlewares.push(middleware)
    }
    getComposed(): ContextHandler {
        if (!this.composed) {
            this.composed =  this.middlewares.reverse().reduce((acc, wrapped) => wrapped(acc), noop)        
        }
        return this.composed
    }
}