import Knex from 'knex';
import subWeeks from 'date-fns/sub_weeks';

import {
  RestaurantSearchConditions,
  getRestaurant,
  Restaurant,
} from './restaurant';
import { MenuItem, CreateMenuItemParams, createMenuItem } from './menuItem';
import { MenuItemComponent } from './menuItemComponent';

export interface Menu {
  id: number;
  created_at: Date;
  updated_at: Date;
  restaurant_id: number;
  date: Date;
  language: string;
  menuItems?: MenuItem[];
  restaurant?: Restaurant;
}

export interface CreateMenuParams {
  restaurant_id: number;
  language: string;
  date: Date;
  menuItems?: CreateMenuItemParams[];
}

export interface MenuSearchConditions {
  restaurantId?: number;
  date?: string;
  language?: string;
}

export interface MenuSearchParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: (string | Knex.Raw<any>)[];
  conditions: MenuSearchConditions;
  restaurantConditions: RestaurantSearchConditions;
  order: string;
}

export const defaultSearchParams: MenuSearchParams = {
  columns: ['menus.*'],
  conditions: {},
  restaurantConditions: { enabled: true },
  order: 'restaurants.id ASC',
};

const getMenuItemComponentsForMenuItem = async (
  db: Knex,
  id: number,
): Promise<MenuItemComponent[]> =>
  await db<MenuItemComponent>('menu_item_components')
    .where('menu_item_id', id)
    .orderBy('menu_item_components.weight')
    .catch((): [] => []);

const getMenuItemsForMenu = async (db: Knex, id: number): Promise<MenuItem[]> =>
  await db<MenuItem>('menu_items')
    .where('menu_id', id)
    .orderBy('menu_items.weight')
    .then(
      async (menuItems): Promise<MenuItem[]> =>
        Promise.all(
          menuItems.map(
            async (item): Promise<MenuItem> => ({
              ...item,
              menuItemComponents: await getMenuItemComponentsForMenuItem(
                db,
                item.id,
              ),
            }),
          ),
        ),
    )
    .catch((): [] => []);

export const getMenu = async (
  db: Knex,
  id: number,
): Promise<Menu | undefined> =>
  await db<Menu>('menus')
    .where('menus.id', id)
    .then(
      async (menus): Promise<Menu> => {
        const restaurant = await getRestaurant(
          db,
          menus[0].restaurant_id,
          false,
        );
        const menuItems = await getMenuItemsForMenu(db, menus[0].id);

        return { ...menus[0], restaurant, menuItems };
      },
    )
    .catch((): undefined => undefined);

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
      async (menus): Promise<Menu[]> => {
        return await Promise.all(
          menus.map(
            async (menu): Promise<Menu> => ({
              ...menu,
              restaurant: await getRestaurant(db, menu.restaurant_id, false),
              menuItems: await getMenuItemsForMenu(db, menu.id),
            }),
          ),
        );
      },
    )
    .catch((): [] => []);

export const createMenu = async (
  db: Knex,
  menu: CreateMenuParams,
): Promise<Menu | void> => {
  const { menuItems, ...menuParams } = menu;
  const createdMenu = await db<Menu>('menus')
    .returning('id')
    .insert(menuParams)
    .catch((): [] => []);

  const menuId = createdMenu[0];

  if (menuId) {
    if (Array.isArray(menuItems) && menuItems.length) {
      menuItems.forEach(
        async (menuItem): Promise<void> =>
          await createMenuItem(db, { ...menuItem, menu_id: menuId }),
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
