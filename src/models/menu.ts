import Knex from 'knex';
import subWeeks from 'date-fns/sub_weeks';
import { gql } from 'apollo-server-express';

import { Context } from '../utils/graphql';
import { normalizeDatabaseData } from '../utils/normalize';
import {
  Restaurant,
  RestaurantSearchConditions,
  getRestaurant,
} from './restaurant';
import {
  MenuItem,
  CreateMenuItemParams,
  getMenuItemsForMenu,
  createMenuItem,
} from './menuItem';

export interface Menu {
  id: number;
  date: Date;
  language: string;
  created_at: Date;
  updated_at: Date;
  restaurant_id: number;
  menu_items?: MenuItem[];
  restaurant?: Restaurant;
}

export interface CreateMenuParams {
  date: Date;
  language: string;
  restaurant_id: number;
  menu_items?: CreateMenuItemParams[];
}

export interface MenuSearchConditions {
  date?: string;
  language?: string;
  restaurant_id?: number;
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

export const getMenu = async (
  db: Knex,
  id: number,
  includeMenuItems: boolean = false,
  includeRestaurant: boolean = false,
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
  includeMenuItems: boolean = false,
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
  includeMenuItems: boolean = false,
  includeRestaurant: boolean = false,
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

export const menuTypeDefs = gql`
  type Menu {
    id: Int!
    language: String!
    date: Date!
    createdAt: Date!
    updatedAt: Date!
    restaurant: Restaurant!
    menuItems: [MenuItem]
  }

  extend type Query {
    menu(id: Int!): Menu
    menus: [Menu]
  }
`;

export const menuResolvers = {
  Query: {
    menu: async (
      _: undefined,
      { id }: { id: number },
      { db }: Context,
    ): Promise<object | undefined> => {
      const data = await getMenu(db, id, false, false);

      if (data) {
        return normalizeDatabaseData(data);
      }
    },
    menus: async (
      _: undefined,
      __: undefined,
      { db }: Context,
    ): Promise<object[]> => {
      const data = await getMenus(db);

      if (data) {
        return normalizeDatabaseData(data);
      }

      return [];
    },
  },
  Menu: {
    restaurant: async (
      menu: { restaurantId: number },
      _: undefined,
      { db }: Context,
    ): Promise<object | undefined> => {
      const data = await getRestaurant(db, menu.restaurantId, false);

      if (data) {
        return normalizeDatabaseData(data);
      }
    },
    menuItems: async (
      menu: { id: number },
      _: undefined,
      { db }: Context,
    ): Promise<object | undefined> => {
      const data = await getMenuItemsForMenu(db, menu.id);

      if (data) {
        return normalizeDatabaseData(data);
      }
    },
  },
};
