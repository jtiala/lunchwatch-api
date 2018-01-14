/**
 * Create imports table.
 *
 * @param  {object} knex
 * @return {Promise}
 */
export function up(knex) {
  return knex.schema.createTable('imports', (table) => {
    table.increments();
    table
      .timestamp('created_at')
      .notNull()
      .defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNull();
    table.timestamp('last_import_at');
    table.string('importer').notNull();
    table.string('identifier').notNull();
    table
      .integer('restaurant_id')
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE')
      .notNull();
    table.string('language', 2).notNull();
    table.boolean('enabled').defaultTo(true).notNull();
  });
}

/**
 * Drop imports table.
 *
 * @param  {object} knex
 * @return {Promise}
 */
export function down(knex) {
  return knex.schema.dropTable('imports');
}
