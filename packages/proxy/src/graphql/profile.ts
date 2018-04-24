import { GraphQLContext } from './context'

export const projectPathDefinition = `
type OutputProjectPath {
  name: String!
  value: String!
}

input InputProjectPath {
  name: String!
  value: String!
}
`

export async function queryProjectPaths(_obj, _args, context: GraphQLContext) {
  const profile = await context.profileConfigService.getProfile()
  return Object.entries(profile.projectPath).map(([name, value]) => ({
    name,
    value
  }))
}

export async function mutateProjectPaths(
  obj,
  { list }: { list: [{ name: string, value: string }] },
  context: GraphQLContext
) {
  const map = list.reduce((map, { name, value }) => {
    map[name] = value
    return map
  }, { })
  await context.profileConfigService.saveProjectPath(map)
  return await queryProjectPaths(obj, {}, context)
}

export async function deleteProjectPath(obj, { name }, context: GraphQLContext) {
  await context.profileConfigService.deleteByName(name)
  return await queryProjectPaths(obj, {}, context)
}
