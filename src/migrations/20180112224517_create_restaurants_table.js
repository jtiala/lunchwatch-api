/**
 * Create restaurants table.
 *
 * @param  {object} knex
 * @return {Promise}
 */
export function up(knex) {
  return knex.schema.createTable('restaurants', (table) => {
    table.increments();
    table
      .timestamp('created_at')
      .notNull()
      .defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNull();
    table.string('name').notNull();
    table.string('chain');
    table.string('url');
    table.string('lat').notNull();
    table.string('lng').notNull();
    table.boolean('enabled').defaultTo(true).notNull();
  });
}

/**
 * Drop restaurants table.
 *
 * @param  {object} knex
 * @return {Promise}
 */
export function down(knex) {
  return knex.schema.dropTable('restaurants');
}
