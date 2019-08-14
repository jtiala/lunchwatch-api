import Knex from 'knex';

import { MenuItemComponent, CreateMenuItemComponentParams } from './interfaces';

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
