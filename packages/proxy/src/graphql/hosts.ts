import { GraphQLContext } from './context';

export const hostsDefinition = `
type HostMeta {
  local: Boolean!
}

type Host {
  hostname: String!
  address: String!
}

type HostRecord {
  meta: HostMeta!
  checked: Boolean!
  name: String!
  description: String!
  content: [Host]
}
`;

export async function queryHostList(_obj, _args, context: GraphQLContext) {
  const list = context.hostService.getHostRecordList();
  return list;
}


