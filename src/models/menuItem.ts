import Knex from 'knex';
import { gql } from 'apollo-server-express';

import {
  Context,
  generateEnumSchema,
  generateEnumResolver,
} from '../utils/graphql';
import { normalizeDatabaseData } from '../utils/normalize';
import {
  MenuItemComponent,
  CreateMenuItemComponentParams,
  getMenuItemComponentsForMenuItem,
  createMenuItemComponent,
} from './menuItemComponent';

export enum MenuItemType {
  NORMAL_MEAL = 'normal_meal',
  VEGETARIAN_MEAL = 'vegetarian_meal',
  LIGHT_MEAL = 'light_meal',
  SPECIAL_MEAL = 'special_meal',
  DESSERT = 'dessert',
  BREAKFAST = 'breakfast',
  LUNCH_TIME = 'lunch_time',
  INFORMATION = 'information',
  PRICE_INFORMATION = 'price_information',
}

export interface MenuItem {
  id: number;
  type: MenuItemType;
  weight: number;
  created_at: Date;
  updated_at: Date;
  menu_id: number;
  menu_item_components?: MenuItemComponent[];
}

export interface CreateMenuItemParams {
  type?: MenuItemType;
  weight?: number;
  menu_id?: number;
  menu_item_components?: CreateMenuItemComponentParams[];
}

export const getMenuItemsForMenu = async (
  db: Knex,
  menuId: number,
  includeMenuItemComponents: boolean = false,
): Promise<MenuItem[]> =>
  await db<MenuItem>('menu_items')
    .where('menu_id', menuId)
    .orderBy('weight')
    .then(
      async (menuItems): Promise<MenuItem[]> =>
        includeMenuItemComponents
          ? await Promise.all(
              menuItems.map(
                async (item): Promise<MenuItem> => ({
                  ...item,
                  menu_item_components: await getMenuItemComponentsForMenuItem(
                    db,
                    item.id,
                  ),
                }),
              ),
            )
          : menuItems,
    )
    .catch((): [] => []);

export const createMenuItem = async (
  db: Knex,
  menuItem: CreateMenuItemParams,
): Promise<void> => {
  const { menu_item_components, ...params } = menuItem;
  const createdMenuItem = await db<MenuItem>('menu_items')
    .returning('id')
    .insert(params)
    .catch((): [] => []);

  const menuItemId = createdMenuItem[0];

  if (menuItemId) {
    if (Array.isArray(menu_item_components) && menu_item_components.length) {
      menu_item_components.forEach(
        async (component): Promise<number[]> =>
          await createMenuItemComponent(db, {
            ...component,
            menu_item_id: menuItemId,
          }),
      );
    }
  }
};

export const menuItemTypeDefs = gql`
  enum MenuItemType
  ${generateEnumSchema(MenuItemType)}

  type MenuItem {
    id: Int!
    type: MenuItemType!
    weight: Int!
    createdAt: Date!
    updatedAt: Date!
    menu: Menu!
    menuItemComponents: [MenuItemComponent]!
  }
`;

export const menuItemResolvers = {
  MenuItem: {
    menuItemComponents: async (
      menuItem: { id: number },
      _: undefined,
      { db }: Context,
    ): Promise<object | undefined> => {
      const data = await getMenuItemComponentsForMenuItem(db, menuItem.id);

      if (data) {
        return normalizeDatabaseData(data);
      }
    },
  },
  MenuItemType: generateEnumResolver(MenuItemType),
};
