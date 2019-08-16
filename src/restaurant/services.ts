import Knex from 'knex';

import { Restaurant, RestaurantSearchParams } from './interfaces';
import { getMenusForRestaurant } from '../menu/services';

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
