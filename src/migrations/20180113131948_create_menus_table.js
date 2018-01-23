/**
 * Create menus table.
 *
 * @param  {object} knex
 * @return {Promise}
 */
export function up(knex) {
  return knex.schema.createTable('menus', (table) => {
    table.bigIncrements();
    table
      .timestamp('created_at')
      .notNull()
      .defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNull();
    table
      .integer('restaurant_id')
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE')
      .notNull();
    table.date('date').notNull();
    table.string('language', 2).notNull();
  });
}

/**
 * Drop menus table.
 *
 * @param  {object} knex
 * @return {Promise}
 */
export function down(knex) {
  return knex.schema.dropTable('menus');
}
