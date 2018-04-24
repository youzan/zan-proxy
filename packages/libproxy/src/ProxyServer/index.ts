import {
  Inject
} from 'typedi'

import {
  Middleware,
  Runtime,
  IForwarderService,
  IForwarder,
  MiddlewareComposer,
  MiddlewareComposerToken
} from '../service'

import {
  HttpServer,
  HttpsServer
} from './servers'

export * from './servers'

export class ProxyServer {
 
  @Inject() httpsProxyServer: HttpsServer
  @Inject() httpProxyServer: HttpServer
  @Inject(IForwarderService) forwarder: IForwarder
  @Inject(MiddlewareComposerToken) composer: MiddlewareComposer

  async start(runtime: Runtime) {
    this.use(() => ctx => this.forwarder.forward(ctx))
    await this.httpProxyServer.listen(runtime.getHttpPort())
    await this.httpsProxyServer.listen(runtime.getHttpsPort())
  }

  use(middleware: Middleware) {
    this.composer.add(middleware)
    return this
  }
}