import Knex from 'knex';
import { gql, IEnumResolver } from 'apollo-server-express';
import { GraphQLScalarType } from 'graphql';

export interface Context {
  db: Knex;
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
