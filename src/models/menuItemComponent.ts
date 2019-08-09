import Knex from 'knex';

export interface MenuItemComponent {
  id: number;
  created_at: Date;
  updated_at: Date;
  menu_item_id: number;
  type: MenuItemComponentType;
  value: string;
  weight: number;
}

export enum MenuItemComponentType {
  FOOD_ITEM = 'food_item',
  NAME = 'name',
  LUNCH_TIME = 'lunch_time',
  INFORMATION = 'information',
  PRICE_INFORMATION = 'price_information',
}

export interface CreateMenuItemComponentParams {
  menu_item_id?: number;
  type?: MenuItemComponentType;
  value?: string;
  weight?: number;
}

export const createMenuItemComponent = async (
  db: Knex,
  menuItemComponent: CreateMenuItemComponentParams,
): Promise<number[]> =>
  await db<MenuItemComponent>('menu_item_components')
    .insert(menuItemComponent)
    .catch((): [] => []);
