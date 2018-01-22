import bookshelf from '../db';
import MenuItem from './menuItem';

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
const MenuItemComponent = bookshelf.Model.extend({
  tableName: TABLE_NAME,
  hasTimestamps: true,
  validTypes: VALID_TYPES,
  menuItem() {
    return this.belongsTo(MenuItem);
  },
});

export default MenuItemComponent;
