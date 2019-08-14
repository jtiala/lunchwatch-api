import { MenuItemType } from './interfaces';
import { MenuItemComponent } from '../menuItemComponent/interfaces';
import { Context, generateEnumResolver } from '../utils/graphql';
import { normalizeDatabaseData } from '../utils/normalize';

const menuItemComponentsFieldResover = async (
  { id }: { id: number },
  _: undefined,
  { db }: Context,
): Promise<object | undefined> => {
  const data = await db<MenuItemComponent>('menu_item_components')
    .where('menu_item_id', id)
    .orderBy('weight');

  if (data) {
    return normalizeDatabaseData(data);
  }
};

export default {
  MenuItem: {
    menuItemComponents: menuItemComponentsFieldResover,
  },
  MenuItemType: generateEnumResolver(MenuItemType),
};
