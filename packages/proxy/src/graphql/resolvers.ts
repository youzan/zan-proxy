import {
  queryProjectPaths,
  mutateProjectPaths,
  deleteProjectPath,
} from './profile';
import { queryHostList } from './hosts';

const resolvers = {
  RootQuery: {
    projectPaths: queryProjectPaths,
    hostsList: queryHostList,
  },
  RootMutation: {
    saveProjectPaths: mutateProjectPaths,
    deleteProjectPath,
  },
};

export default resolvers;
