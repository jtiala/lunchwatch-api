import bookshelf from '../db';

const TABLE_NAME = 'restaurants';

/**
 * Restaurant model.
 */
class Restaurant extends bookshelf.Model {
  get tableName() {
    return TABLE_NAME;
  }

  get hasTimestamps() {
    return true;
  }
}

export default Restaurant;
