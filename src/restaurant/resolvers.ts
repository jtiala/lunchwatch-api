// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { knexPaginator as paginate } from 'apollo-cursor-pagination';
import Knex from 'knex';

import { Restaurant, RestaurantSearchConditions } from './interfaces';
import { Menu } from '../menu/interfaces';
import { ImportDetails } from '../importDetails/interfaces';
import {
  Context,
  Location,
  Pagination,
  parseLocation,
  parsePaginationParams,
  parseConditions,
} from '../utils/graphql';
import { normalizeDatabaseData } from '../utils/normalize';

const restaurantQueryResolver = async (
  _: undefined,
  { id }: { id: number },
  { db }: Context,
): Promise<object | undefined> => {
  const data = await db<Restaurant>('restaurants').where('id', id);

  if (data) {
    return normalizeDatabaseData(data[0]);
  }
};

const restaurantsQueryResolver = async (
  _: undefined,
  args: RestaurantSearchConditions & Location & Pagination,
  { db }: Context,
): Promise<object[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: (string | Knex.Raw<any>)[] = ['*'];
  const location = parseLocation(args);
  const pagination = parsePaginationParams(args);
  const conditions: RestaurantSearchConditions = parseConditions({
    chain: typeof args.chain === 'string' ? args.chain : undefined,
    enabled: typeof args.enabled === 'boolean' ? args.enabled : undefined,
  });

  if (location) {
    columns.push(
      db.raw(
        `((2 * 3961
          * asin(sqrt((sin(radians((lat - ${location.lat}) / 2))) ^ 2
          + cos(radians(${location.lat})) * cos(radians(lat))
          * (sin(radians((lng - ${location.lng}) / 2))) ^ 2)))
          * 1.60934) as distance`,
      ),
    );
  }

  const baseQuery = db<Restaurant>('restaurants')
    .select(columns)
    .where(conditions)
    .groupBy('id');

  const data = await paginate(baseQuery, pagination);

  if (data) {
    return normalizeDatabaseData(data);
  }

  return [];
};

const menusFieldResover = async (
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
};

const importDetailsFieldResolver = async (
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
};

export default {
  Query: {
    restaurant: restaurantQueryResolver,
    restaurants: restaurantsQueryResolver,
  },
  Restaurant: {
    menus: menusFieldResover,
    importDetails: importDetailsFieldResolver,
  },
};
