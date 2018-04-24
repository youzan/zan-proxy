import { HttpLink } from 'apollo-link-http'

import { startView } from '../manager'

const link = new HttpLink({
  uri: 'http://127.0.0.1:40001/graphql'
})

startView(link)
