import bookshelf from '../db';
import Restaurant from './restaurant';
import MenuItem from './menuItem';

const TABLE_NAME = 'menus';

/**
 * Menu model.
 */
const Menu = bookshelf.Model.extend({
  tableName: TABLE_NAME,
  hasTimestamps: true,
  restaurant() {
    return this.belongsTo(Restaurant);
  },
  menuItems() {
    return this.hasMany(MenuItem);
  },
});

export default Menu;
