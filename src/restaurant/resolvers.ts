// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import { knexPaginator as paginate } from 'apollo-cursor-pagination';
import { UserInputError } from 'apollo-server-express';

import { Restaurant } from './interfaces';
import { Menu } from '../menu/interfaces';
import { ImportDetails } from '../importDetails/interfaces';
import { Context, Pagination } from '../utils/graphql';
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
