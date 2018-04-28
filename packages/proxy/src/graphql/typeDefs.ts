import { projectPathDefinition } from './profile';
import { hostsDefinition } from './hosts';

const RootQuery = `
type RootQuery {
  projectPaths: [OutputProjectPath]
  hostsList: [HostRecord]
}
`;

const RootMutation = `
type RootMutation {
  saveProjectPaths(list: [InputProjectPath]): [OutputProjectPath]
  deleteProjectPath(name: String!): [OutputProjectPath]
}
`;

const SchemaDefinition = `
schema {
  query: RootQuery
  mutation: RootMutation
}
`;

export default [
  SchemaDefinition,
  RootQuery,
  RootMutation,
  projectPathDefinition,
  hostsDefinition,
];
