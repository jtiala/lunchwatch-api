import bookshelf from '../db';
import Restaurant from './restaurant';

const TABLE_NAME = 'imports';

/**
 * Import model.
 */
const Import = bookshelf.Model.extend({
  tableName: TABLE_NAME,
  hasTimestamps: true,
  menuItem() {
    return this.belongsTo(Restaurant);
  },
});

export default Import;
