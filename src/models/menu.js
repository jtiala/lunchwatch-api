/* eslint-disable class-methods-use-this */

import bookshelf from '../db';

const TABLE_NAME = 'menus';

/**
 * Menu model.
 */
class Menu extends bookshelf.Model {
  get tableName() {
    return TABLE_NAME;
  }

  get hasTimestamps() {
    return true;
  }
}

export default Menu;
