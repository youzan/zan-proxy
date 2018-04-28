import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';
// import { GraphQLContext } from './context';
// import { projectPathsResolver } from './projectPath'
import typeDefs from './typeDefs';

export * from './context';

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
} as any);
