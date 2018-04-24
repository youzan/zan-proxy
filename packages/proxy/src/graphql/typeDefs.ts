import { projectPathDefinition } from './profile'

const RootQuery = `
type RootQuery {
  projectPaths: [OutputProjectPath]
}
`

const RootMutation = `
type RootMutation {
  saveProjectPaths(list: [InputProjectPath]): [OutputProjectPath]
  deleteProjectPath(name: String!): [OutputProjectPath]
}
`

const SchemaDefinition = `
schema {
  query: RootQuery
  mutation: RootMutation
}
`

export default [SchemaDefinition, RootQuery, RootMutation, projectPathDefinition]
