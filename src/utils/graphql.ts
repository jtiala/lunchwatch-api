import Knex from 'knex';
import { GraphQLScalarType } from 'graphql';
import { gql, IEnumResolver } from 'apollo-server-express';

export interface Context {
  db: Knex;
}

export interface Pagination {
  first: number;
  last: number;
  before: string;
  after: string;
  orderBy: string;
  orderDirection: 'asc' | 'desc';
}

export const generateEnumSchema = (tsEnum: object): string =>
  `{${Object.keys(tsEnum).join(', ')}}`;

export const generateEnumResolver = (tsEnum: object): IEnumResolver =>
  Object.entries(tsEnum).reduce(
    (res, [key, value]): IEnumResolver => ({
      ...res,
      [key]: value,
    }),
    {},
  );

export const rootTypeDefs = gql`
  scalar Date

  type PageInfo {
    hasNextPage: Boolean
    hasPreviousPage: Boolean
    startCursor: String
    endCursor: String
  }

  enum OrderDirection {
    asc
    desc
  }

  type Query

  schema {
    query: Query
  }
`;

export const rootResolvers = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: (value): Date => new Date(value),
    serialize: (value): string => value.toISOString(),
  }),
};
