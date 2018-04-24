import Vue from 'vue'
import Router from 'vue-router'
import VueApollo from 'vue-apollo'
import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import App from './App'
import routes from './routes'

export function startView(link) {
  const apolloClient = new ApolloClient({
    link,
    cache: new InMemoryCache(),
    connectToDevTools: true
  })

  Vue.use(VueApollo)
  Vue.use(ElementUI)
  Vue.use(Router)

  const router = new Router({
    routes
  })

  const apolloProvider = new VueApollo({
    defaultClient: apolloClient,
  })

  new Vue({
    el: '#app',
    provide: apolloProvider.provide(),
    router,
    render: h => h(App)
  })
}
