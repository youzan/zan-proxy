import { Inject } from 'typedi'
import { ObjectType, Field, Resolver, Query, Mutation, InputType, Arg } from 'type-graphql';
import { ProfileConfigServiceToken, ProfileConfigService } from '../service';

@ObjectType()
@InputType()
export class ProjectPath {
  @Field()
  name: string;

  @Field()
  value: string;
}

@Resolver()
export class ProfileResolver {
  @Inject(ProfileConfigServiceToken) profileConfigService: ProfileConfigService;

  @Query(_returns => [ProjectPath])
  async projectPaths(): Promise<ProjectPath[]> {
    const profile = await this.profileConfigService.getProfile()
    return Object.entries(profile.projectPath).map(([name, value]) => ({
      name,
      value: value as any as string
    }))
  }

  @Mutation(_returns => [ProjectPath])
  async saveProjectPaths(@Arg('projectPath', _type => [ProjectPath]) projectPaths: ProjectPath[]) {
    console.log(projectPaths)
  }
}

export default ProfileResolver

// export async function queryProjectPaths(_obj, _args, context: GraphQLContext) {
//   const profile = await context.profileConfigService.getProfile()
//   return Object.entries(profile.projectPath).map(([name, value]) => ({
//     name,
//     value
//   }))
// }

// export async function mutateProjectPaths(
//   obj,
//   { list }: { list: [{ name: string, value: string }] },
//   context: GraphQLContext
// ) {
//   const map = list.reduce((map, { name, value }) => {
//     map[name] = value
//     return map
//   }, { })
//   await context.profileConfigService.saveProjectPath(map)
//   return await queryProjectPaths(obj, {}, context)
// }

// export async function deleteProjectPath(obj, { name }, context: GraphQLContext) {
//   await context.profileConfigService.deleteByName(name)
//   return await queryProjectPaths(obj, {}, context)
// }
