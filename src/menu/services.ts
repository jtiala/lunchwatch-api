import Knex from 'knex';
import subWeeks from 'date-fns/sub_weeks';

import { Menu, MenuSearchParams, CreateMenuParams } from './interfaces';
import { getRestaurant } from '../restaurant/services';
import { getMenuItemsForMenu, createMenuItem } from '../menuItem/services';

export const getMenu = async (
  db: Knex,
  id: number,
  includeMenuItems = false,
  includeRestaurant = false,
): Promise<Menu | undefined> =>
  await db<Menu>('menus')
    .where('id', id)
    .then(
      async (menus): Promise<Menu> => ({
        ...menus[0],
        menu_items: includeMenuItems
          ? await getMenuItemsForMenu(db, menus[0].id, true)
          : undefined,
        restaurant: includeRestaurant
          ? await getRestaurant(db, menus[0].restaurant_id)
          : undefined,
      }),
    )
    .catch((): undefined => undefined);

export const getMenus = async (db: Knex): Promise<Menu[]> =>
  await db<Menu>('menus').catch((): [] => []);

export const getMenusForRestaurant = async (
  db: Knex,
  restaurantId: number,
  includeMenuItems = false,
): Promise<Menu[]> =>
  await db<Menu>('menus')
    .where('restaurant_id', restaurantId)
    .then(
      async (menus): Promise<Menu[]> =>
        includeMenuItems
          ? await Promise.all(
              menus.map(
                async (menu): Promise<Menu> => ({
                  ...menu,
                  menu_items: await getMenuItemsForMenu(db, menu.id, true),
                }),
              ),
            )
          : menus,
    )
    .catch((): [] => []);

export const countMenus = async (
  db: Knex,
  searchParams: MenuSearchParams,
): Promise<number> =>
  await db<Menu>('menus')
    .join(
      db('restaurants')
        .where(searchParams.restaurantConditions)
        .as('restaurants'),
      'menus.restaurant_id',
      'restaurants.id',
    )
    .count('menus.id')
    .where(searchParams.conditions)
    .then((countResult: { [index: string]: number | string }[]): number => {
      const count = countResult[0].count;
      return typeof count === 'number' ? count : parseInt(count, 10);
    })
    .catch((): number => 0);

export const searchMenus = async (
  db: Knex,
  searchParams: MenuSearchParams,
  limit: number,
  offset: number,
  includeMenuItems = false,
  includeRestaurant = false,
): Promise<Menu[]> =>
  await db<Menu>('menus')
    .join(
      db('restaurants')
        .where(searchParams.restaurantConditions)
        .as('restaurants'),
      'menus.restaurant_id',
      'restaurants.id',
    )
    .select(searchParams.columns)
    .where(searchParams.conditions)
    .orderByRaw(searchParams.order)
    .limit(limit)
    .offset(offset)
    .then(
      async (menus): Promise<Menu[]> =>
        await Promise.all(
          menus.map(
            async (menu): Promise<Menu> => ({
              ...menu,
              menu_items: includeMenuItems
                ? await getMenuItemsForMenu(db, menu.id, true)
                : undefined,
              restaurant: includeRestaurant
                ? await getRestaurant(db, menu.restaurant_id)
                : undefined,
            }),
          ),
        ),
    )
    .catch((): [] => []);

export const createMenu = async (
  db: Knex,
  menu: CreateMenuParams,
): Promise<Menu | void> => {
  const { menu_items, ...params } = menu;
  const createdMenu = await db<Menu>('menus')
    .returning('id')
    .insert(params)
    .catch((): [] => []);

  const menuId = createdMenu[0];

  if (menuId) {
    if (Array.isArray(menu_items) && menu_items.length) {
      menu_items.forEach(
        async (item): Promise<void> =>
          await createMenuItem(db, { ...item, menu_id: menuId }),
      );
    }

    return await getMenu(db, menuId);
  }
};

export const deleteMenusForRestaurantForDate = async (
  db: Knex,
  restaurantId: number,
  language: string,
  date: Date,
): Promise<number> =>
  await db<Menu>('menus')
    .where({
      restaurant_id: restaurantId,
      date,
      language,
    })
    .delete()
    .catch((): number => 0);

export const deleteMenusOlderThan = async (
  db: Knex,
  weeks: number,
): Promise<number> =>
  await db<Menu>('menus')
    .where('date', '<', subWeeks(Date(), weeks))
    .delete()
    .catch((): number => 0);
