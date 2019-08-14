// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { knexPaginator as paginate } from 'apollo-cursor-pagination';
import { gql, UserInputError } from 'apollo-server-express';
import Knex from 'knex';

import { Context, Pagination } from '../utils/graphql';
import { normalizeDatabaseData } from '../utils/normalize';
import { Menu, getMenusForRestaurant } from './menu';
import { ImportDetails } from './importDetails';

export interface Restaurant {
  id: number;
  name: string;
  chain?: string;
  url?: string;
  lat: number;
  lng: number;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
  menus?: Menu[];
  distance?: number;
}

export interface RestaurantSearchConditions {
  chain?: string;
  enabled?: boolean;
}

export interface RestaurantSearchParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: (string | Knex.Raw<any>)[];
  conditions: RestaurantSearchConditions;
  order: string;
}

export const defaultSearchParams: RestaurantSearchParams = {
  columns: ['restaurants.*'],
  conditions: { enabled: true },
  order: 'restaurants.id ASC',
};

export const getRestaurant = async (
  db: Knex,
  id: number,
  includeMenus = false,
): Promise<Restaurant | undefined> =>
  await db<Restaurant>('restaurants')
    .where('id', id)
    .then(
      async (restaurants: Restaurant[]): Promise<Restaurant> => ({
        ...restaurants[0],
        menus: includeMenus
          ? await getMenusForRestaurant(db, restaurants[0].id, true)
          : undefined,
      }),
    )
    .catch((): undefined => undefined);

export const getRestaurants = async (
  db: Knex,
  includeMenus = false,
): Promise<Restaurant[]> =>
  await db<Restaurant>('restaurants')
    .then(
      async (restaurants): Promise<Restaurant[]> =>
        includeMenus
          ? await Promise.all(
              restaurants.map(
                async (restaurant): Promise<Restaurant> => ({
                  ...restaurant,
                  menus: await getMenusForRestaurant(db, restaurant.id, true),
                }),
              ),
            )
          : restaurants,
    )
    .catch((): [] => []);

export const countRestaurants = async (
  db: Knex,
  searchParams: RestaurantSearchParams,
): Promise<number> =>
  await db<Restaurant>('restaurants')
    .count('restaurants.id')
    .where(searchParams.conditions)
    .then((countResult: { [index: string]: number | string }[]): number => {
      const count = countResult[0].count;
      return typeof count === 'number' ? count : parseInt(count, 10);
    })
    .catch((): number => 0);

export const searchRestaurants = async (
  db: Knex,
  searchParams: RestaurantSearchParams,
  limit: number,
  offset: number,
  includeMenus = false,
): Promise<object[]> =>
  await db<Restaurant>('restaurants')
    .select(searchParams.columns)
    .where(searchParams.conditions)
    .orderByRaw(searchParams.order)
    .limit(limit)
    .offset(offset)
    .then(
      async (restaurants): Promise<object[]> =>
        includeMenus
          ? await Promise.all(
              restaurants.map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                async (restaurant: any): Promise<object> => ({
                  ...restaurant,
                  menus: await getMenusForRestaurant(db, restaurant.id, true),
                }),
              ),
            )
          : restaurants,
    )
    .catch((): [] => []);

export const restaurantTypeDefs = gql`
  type Restaurant {
    id: Int!
    name: String!
    chain: String
    url: String
    lat: Float!
    lng: Float!
    enabled: Boolean!
    createdAt: Date!
    updatedAt: Date!
    menus: [Menu]!
    importDetails: [ImportDetails]!
  }

  type RestaurantConnection {
    pageInfo: PageInfo!
    edges: [RestaurantEdge]!
    totalCount: Int!
  }

  type RestaurantEdge {
    cursor: String!
    node: Restaurant!
  }

  extend type Query {
    restaurant(id: Int!): Restaurant
    restaurants(
      first: Int
      last: Int
      before: String
      after: String
      orderBy: String
      orderDirection: OrderDirection
    ): RestaurantConnection!
  }
`;

export const restaurantResolvers = {
  Query: {
    restaurant: async (
      _: undefined,
      { id }: { id: number },
      { db }: Context,
    ): Promise<object | undefined> => {
      const data = await db<Restaurant>('restaurants').where('id', id);

      if (data) {
        return normalizeDatabaseData(data[0]);
      }
    },
    restaurants: async (
      _: undefined,
      {
        first,
        last,
        before,
        after,
        orderBy = 'id',
        orderDirection = 'asc',
      }: Pagination,
      { db }: Context,
    ): Promise<object[]> => {
      if (first < 0) {
        throw new UserInputError('First must be positive number');
      }

      if (last < 0) {
        throw new UserInputError('Last must be positive number');
      }

      const baseQuery = db<Restaurant>('restaurants');

      const data = await paginate(baseQuery, {
        first: !first && !last ? 10 : first,
        last,
        before,
        after,
        orderBy,
        orderDirection,
      });

      if (data) {
        return normalizeDatabaseData(data);
      }

      return [];
    },
  },
  Restaurant: {
    menus: async (
      { id }: { id: number },
      _: undefined,
      { db }: Context,
    ): Promise<object[]> => {
      const data = await db<Menu>('menus')
        .where('restaurant_id', id)
        .orderBy('date');

      if (data) {
        return normalizeDatabaseData(data);
      }

      return [];
    },
    importDetails: async (
      { id }: { id: number },
      _: undefined,
      { db }: Context,
    ): Promise<object[]> => {
      const data = await db<ImportDetails>('import_details')
        .where('restaurant_id', id)
        .orderBy('id');

      if (data) {
        return normalizeDatabaseData(data);
      }

      return [];
    },
  },
};
