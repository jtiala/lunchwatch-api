import bookshelf from '../db';
import Menu from './menu';
import MenuItemComponent from './menuItemComponent';

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
const MenuItem = bookshelf.Model.extend({
  tableName: TABLE_NAME,
  hasTimestamps: true,
  validTypes: VALID_TYPES,
  menu() {
    return this.belongsTo(Menu);
  },
  menuItemComponents() {
    return this.hasMany(MenuItemComponent);
  },
});

export default MenuItem;
