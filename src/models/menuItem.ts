import Knex from 'knex';

import {
  MenuItemComponent,
  CreateMenuItemComponentParams,
  createMenuItemComponent,
} from './menuItemComponent';

export interface MenuItem {
  id: number;
  created_at: Date;
  updated_at: Date;
  menu_id: number;
  type: MenuItemType;
  weight: number;
  menuItemComponents?: MenuItemComponent[];
}

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

export interface CreateMenuItemParams {
  menu_id?: number;
  type?: MenuItemType;
  weight?: number;
  menuItemComponents?: CreateMenuItemComponentParams[];
}

export const createMenuItem = async (
  db: Knex,
  menuItem: CreateMenuItemParams,
): Promise<void> => {
  const { menuItemComponents, ...menuItemParams } = menuItem;
  const createdMenuItem = await db<MenuItem>('menu_items')
    .returning('id')
    .insert(menuItemParams)
    .catch((): [] => []);

  const menuItemId = createdMenuItem[0];

  if (menuItemId) {
    if (Array.isArray(menuItemComponents) && menuItemComponents.length) {
      menuItemComponents.forEach(
        async (menuItemComponent): Promise<number[]> =>
          await createMenuItemComponent(db, {
            ...menuItemComponent,
            menu_item_id: menuItemId,
          }),
      );
    }
  }
};
