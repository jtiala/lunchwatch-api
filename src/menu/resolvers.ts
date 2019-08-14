// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { knexPaginator as paginate } from 'apollo-cursor-pagination';
import { UserInputError } from 'apollo-server-express';

import { Menu } from './interfaces';
import { Restaurant } from '../restaurant/interfaces';
import { MenuItem } from '../menuItem/interfaces';
import { Context, Pagination } from '../utils/graphql';
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

  const baseQuery = db<Menu>('menus');

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
};

const restaurantFieldResover = async (
  { restaurantId }: { restaurantId: number },
  _: undefined,
  { db }: Context,
): Promise<object | undefined> => {
  const data = await db<Restaurant>('restaurants').where('id', restaurantId);

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
