import Knex from 'knex';
import { GraphQLScalarType } from 'graphql';
import { gql, IEnumResolver, UserInputError } from 'apollo-server-express';

export interface Context {
  db: Knex;
}

export interface Location {
  lat?: number;
  lng?: number;
}

export interface Pagination {
  first?: number;
  last?: number;
  before?: string;
  after?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export const validateLocation = (location: Location): boolean => {
  if ((location.lat && !location.lng) || (!location.lat && location.lng)) {
    throw new UserInputError('Both lat and lng must be present');
  } else if (location.lat && location.lng) {
    return true;
  }

  return false;
};

export const validatePagination = (pagination: Pagination): void => {
  if (pagination.first && pagination.first < 0) {
    throw new UserInputError('First must be positive number');
  }

  if (pagination.last && pagination.last < 0) {
    throw new UserInputError('Last must be positive number');
  }
};

export const parseLocation = (args: Location): Location | undefined => {
  if (validateLocation(args)) {
    return args;
  }

  return undefined;
};

export const parsePaginationParams = (args: Pagination): Pagination => {
  validatePagination(args);

  return {
    first: !args.first && !args.last ? 10 : args.first,
    last: args.last,
    before: args.before,
    after: args.after,
    orderBy: args.orderBy || 'id',
    orderDirection: args.orderDirection || 'asc',
  };
};

export const parseConditions = <T>(args: T): T => {
  const keysToIterateOver = Object.keys(args) as (keyof T)[];

  keysToIterateOver.forEach(
    (key) => args[key] === undefined && delete args[key],
  );

  return args;
};

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
