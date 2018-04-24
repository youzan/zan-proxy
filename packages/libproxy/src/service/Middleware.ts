import { Token } from 'typedi';
import { Context } from './Context'

export type ContextHandler = (ctx: Context) => any
export const ContextHandlerService = new Token<ContextHandler>('ContextHandler')

export type Middleware = (next: ContextHandler) => ContextHandler

export interface IForwarder {
  forward(ctx): Promise<any>
}

export const IForwarderService = new Token<IForwarder>('Forwarder')

export interface MiddlewareComposer {
  add(middleware: Middleware)
  getComposed(): ContextHandler
}

export const MiddlewareComposerToken = new Token<MiddlewareComposer>('MiddlewareComposer')