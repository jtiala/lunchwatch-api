import Knex from 'knex';

import { Menu } from './menu';

export interface Restaurant {
  id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  chain: string;
  url: string;
  lat: number;
  lng: number;
  enabled: boolean;
  menus?: Menu[];
  distance?: number;
}

export interface RestaurantSearchConditions {
  enabled?: boolean;
  chain?: string;
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

const getMenusForRestaurant = async (db: Knex, id: number): Promise<Menu[]> =>
  await db<Menu>('menus')
    .where('restaurant_id', id)
    .catch((): [] => []);

export const getRestaurant = async (
  db: Knex,
  id: number,
  getMenus: boolean = true,
): Promise<Restaurant | undefined> =>
  await db<Restaurant>('restaurants')
    .where('restaurants.id', id)
    .then(
      async (restaurants: Restaurant[]): Promise<Restaurant> => {
        const menus = getMenus
          ? await getMenusForRestaurant(db, restaurants[0].id)
          : undefined;

        return { ...restaurants[0], menus };
      },
    )
    .catch((): undefined => undefined);

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
): Promise<object[]> =>
  await db<Restaurant>('restaurants')
    .select(searchParams.columns)
    .where(searchParams.conditions)
    .orderByRaw(searchParams.order)
    .limit(limit)
    .offset(offset)
    .catch((): [] => []);
