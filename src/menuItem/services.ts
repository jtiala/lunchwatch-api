import Knex from 'knex';

import { MenuItem, CreateMenuItemParams } from './interfaces';
import {
  getMenuItemComponentsForMenuItem,
  createMenuItemComponent,
} from '../menuItemComponent/services';

export const getMenuItemsForMenu = async (
  db: Knex,
  menuId: number,
  includeMenuItemComponents = false,
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
