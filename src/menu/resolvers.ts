// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { knexPaginator as paginate } from 'apollo-cursor-pagination';
import Knex from 'knex';

import { Menu, MenuSearchConditions } from './interfaces';
import { Restaurant } from '../restaurant/interfaces';
import { MenuItem } from '../menuItem/interfaces';
import {
  Context,
  Location,
  Pagination,
  parseLocation,
  parsePaginationParams,
  parseConditions,
} from '../utils/graphql';
import { normalizeDatabaseData } from '../utils/normalize';

const menuQueryResolver = async (
  _: undefined,
  { id }: { id: number },
  { db }: Context,
): Promise<object | undefined> => {
  const data = await db<Menu>('menus').where('id', id);

  if (data) {
    return normalizeDatabaseData(data[0]);
  }
};

const menusQueryResolver = async (
  _: undefined,
  args: MenuSearchConditions & Location & Pagination,
  { db }: Context,
): Promise<object[]> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: (string | Knex.Raw<any>)[] = ['*'];
  const location = parseLocation(args);
  const pagination = parsePaginationParams(args);
  const conditions: MenuSearchConditions = parseConditions({
    date: args.date instanceof Date ? args.date : undefined,
    language: typeof args.language === 'string' ? args.language : undefined,
    restaurant_id:
      typeof args.restaurant_id === 'string' ? args.restaurant_id : undefined,
  });

  if (location) {
    columns.push(
      db.raw(
        `(SELECT ((2 * 3961
          * asin(sqrt((sin(radians((lat - ${location.lat}) / 2))) ^ 2
          + cos(radians(${location.lat})) * cos(radians(lat))
          * (sin(radians((lng - ${location.lng}) / 2))) ^ 2)))
          * 1.60934)
          FROM restaurants WHERE restaurants.id = menus.restaurant_id
          ) as distance`,
      ),
    );
  }

  const baseQuery = db<Menu>('menus')
    .select(columns)
    .where(conditions)
    .groupBy('id');

  const data = await paginate(baseQuery, pagination);

  if (data) {
    return normalizeDatabaseData(data);
  }

  return [];
};

const restaurantFieldResover = async (
  {
    restaurantId,
    distance,
  }: { restaurantId: number; distance: number | undefined },
  _: undefined,
  { db }: Context,
): Promise<object | undefined> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: (string | Knex.Raw<any>)[] = ['*'];

  if (distance) {
    columns.push(db.raw(`'${distance}' as distance`));
  }

  const data = await db<Restaurant>('restaurants')
    .select(columns)
    .where('id', restaurantId);

  if (data) {
    return normalizeDatabaseData(data[0]);
  }
};

const menuItemsFieldResolver = async (
  { id }: { id: number },
  _: undefined,
  { db }: Context,
): Promise<object | undefined> => {
  const data = await db<MenuItem>('menu_items')
    .where('menu_id', id)
    .orderBy('weight');

  if (data) {
    return normalizeDatabaseData(data);
  }
};

export default {
  Query: {
    menu: menuQueryResolver,
    menus: menusQueryResolver,
  },
  Menu: {
    restaurant: restaurantFieldResover,
    menuItems: menuItemsFieldResolver,
  },
};
