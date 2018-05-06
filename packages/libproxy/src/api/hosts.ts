import { Inject } from 'typedi'
import { ObjectType, Field, Resolver, Query } from 'type-graphql'

import { Host as IHost, HostRecord as IHostRecord, HostRecordMeta as IMeta, HostService, HostServiceToken } from '../service/Host'

@ObjectType()
class Host implements IHost {
  @Field()
  hostname: string

  @Field()
  address: string
}

@ObjectType()
class HostRecordMeta implements IMeta {
  @Field()
  local: boolean;
}

@ObjectType()
class HostRecord implements IHostRecord {
  @Field(_type => HostRecordMeta)
  meta: HostRecordMeta;

  @Field()
  checked: boolean;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(_type => [Host])
  content: Host[];
}

@Resolver()
export class HostRecordResolver {
  @Inject(HostServiceToken) private hostService: HostService;

  @Query(_returns => [HostRecord])
  async hostList() {
    const list = await this.hostService.getHostRecordList();
    return list;
  }
}
