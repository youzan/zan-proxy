import { queryProjectPaths, mutateProjectPaths, deleteProjectPath } from "./profile";

const resolvers = {
  RootQuery: {
    projectPaths: queryProjectPaths
  },
  RootMutation: {
    saveProjectPaths: mutateProjectPaths,
    deleteProjectPath
  }
}

export default resolvers
