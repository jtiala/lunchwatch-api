/**
 * Create menu_item_components table.
 *
 * @param  {object} knex
 * @return {Promise}
 */
export function up(knex) {
  return knex.schema.createTable('menu_item_components', (table) => {
    table.increments();
    table
      .timestamp('created_at')
      .notNull()
      .defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNull();
    table
      .integer('menu_item_id')
      .references('id')
      .inTable('menu_items')
      .onDelete('CASCADE')
      .notNull();
    table.string('name').notNull();
    table.integer('weight').notNull().defaultTo(1);
  });
}

/**
 * Create menu_item_components table.
 *
 * @param  {object} knex
 * @return {Promise}
 */
export function down(knex) {
  return knex.schema.dropTable('menu_item_components');
}
