import { Service, Container } from 'typedi'
import http from 'http'
import path from 'path'
import Koa from 'koa'
import Router from 'koa-router'
import koaBody from 'koa-bodyparser'
import serve from 'koa-static'
import SocketIO from 'socket.io'
import { graphqlKoa, graphiqlKoa } from 'apollo-server-koa'

import { schema, GraphQLContext } from './graphql'

@Service()
export class UIServer {
  app = new Koa()
  server = http.createServer(this.app.callback())
  io = SocketIO(this.server)
  router = new Router()

  constructor() {
    this.app.use(koaBody())
    this.router.post(
      '/graphql',
      graphqlKoa({
        schema,
        context: Container.get(GraphQLContext)
      })
    )
    this.router.get(
      '/graphiql',
      graphiqlKoa({
        endpointURL: '/graphql'
      })
    )
    this.app.use(this.router.routes())
    this.app.use(this.router.allowedMethods())
    this.app.use(
      serve(path.resolve(__dirname, '../static'), {
        index: 'index.html'
      })
    )
  }

  listen(port: number) {
    this.server.listen(port)
  }

  // constructor(
  //   @Inject(HostServiceToken) private hostService: HostService,
  //   @Inject(RuleServiceToken) private ruleService: RuleService,
  //   @Inject(MockServiceToken) private mockDataService: MockService,
  //   @Inject(ProfileConfigServiceToken) private profileConfigService: ProfileConfigService
  // ) {

  // }
}
