/* eslint-disable class-methods-use-this */

import bookshelf from '../db';

const TABLE_NAME = 'menu_item_components';

/**
 * MenuItemComponent model.
 */
class MenuItemComponent extends bookshelf.Model {
  get tableName() {
    return TABLE_NAME;
  }

  get hasTimestamps() {
    return true;
  }
}

export default MenuItemComponent;
