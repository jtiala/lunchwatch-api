/* eslint-disable class-methods-use-this */

import bookshelf from '../db';

const TABLE_NAME = 'menu_items';
const VALID_TYPES = [
  'normal_meal',
  'vegetarian_meal',
  'light_meal',
  'special_meal',
  'dessert',
  'breakfast',
  'lunch_time',
  'information',
  'price_information',
];

/**
 * MenuItem model.
 */
class MenuItem extends bookshelf.Model {
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

export default MenuItem;
