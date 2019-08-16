import { gql } from 'apollo-server-express';

import { ImporterType } from './interfaces';
import { generateEnumSchema } from '../utils/graphql';

export default gql`
  enum ImporterType
  ${generateEnumSchema(ImporterType)}

  type ImportDetails {
    id: Int!
    type: ImporterType!
    identifier: String!
    language: String!
    enabled: Boolean!
    lastImportAt: Date
    createdAt: Date!
    updatedAt: Date!
    restaurant: Restaurant!
  }
`;
