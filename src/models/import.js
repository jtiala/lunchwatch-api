/* eslint-disable class-methods-use-this */

import bookshelf from '../db';

const TABLE_NAME = 'imports';

/**
 * Import model.
 */
class Import extends bookshelf.Model {
  get tableName() {
    return TABLE_NAME;
  }

  get hasTimestamps() {
    return true;
  }
}

export default Import;
