import bookshelf from '../db';
import Menu from './menu';

const TABLE_NAME = 'restaurants';

/**
 * Restaurant model.
 */
const Restaurant = bookshelf.Model.extend({
  tableName: TABLE_NAME,
  hasTimestamps: true,
  menus() {
    return this.hasMany(Menu);
  },
});

export default Restaurant;
