import { Container } from 'typedi'
import { useContainer, buildSchemaSync } from 'type-graphql'
import { HostRecordResolver } from './hosts';
import { ProfileResolver } from './profile';

useContainer(Container)

export const schema: any = buildSchemaSync({
  resolvers: [HostRecordResolver, ProfileResolver]
})
