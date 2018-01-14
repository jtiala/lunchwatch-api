/* eslint-disable class-methods-use-this */

import bookshelf from '../db';

const TABLE_NAME = 'menu_item_components';
const VALID_TYPES = [
  'name',
  'food_item',
  'lunch_time',
  'information',
  'price_information',
];

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

  get validTypes() {
    return VALID_TYPES;
  }
}

export default MenuItemComponent;
