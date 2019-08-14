import Knex from 'knex';
import { gql } from 'apollo-server-express';

import { generateEnumSchema, generateEnumResolver } from '../utils/graphql';

export enum MenuItemComponentType {
  FOOD_ITEM = 'food_item',
  NAME = 'name',
  LUNCH_TIME = 'lunch_time',
  INFORMATION = 'information',
  PRICE_INFORMATION = 'price_information',
}

export interface MenuItemComponent {
  id: number;
  type: MenuItemComponentType;
  value: string;
  weight: number;
  created_at: Date;
  updated_at: Date;
  menu_item_id: number;
}

export interface CreateMenuItemComponentParams {
  type?: MenuItemComponentType;
  value?: string;
  weight?: number;
  menu_item_id?: number;
}

export const getMenuItemComponentsForMenuItem = async (
  db: Knex,
  menuItemId: number,
): Promise<MenuItemComponent[]> =>
  await db<MenuItemComponent>('menu_item_components')
    .where('menu_item_id', menuItemId)
    .orderBy('weight')
    .catch((): [] => []);

export const createMenuItemComponent = async (
  db: Knex,
  menuItemComponent: CreateMenuItemComponentParams,
): Promise<number[]> =>
  await db<MenuItemComponent>('menu_item_components')
    .insert(menuItemComponent)
    .catch((): [] => []);

export const menuItemComponentTypeDefs = gql`
  enum MenuItemComponentType
  ${generateEnumSchema(MenuItemComponentType)}

  type MenuItemComponent {
    id: Int!
    type: MenuItemComponentType!
    weight: Int!
    value: String
    createdAt: Date!
    updatedAt: Date!
    menuItem: MenuItem!
  }
`;

export const menuItemComponentResolvers = {
  MenuItemComponentType: generateEnumResolver(MenuItemComponentType),
};
