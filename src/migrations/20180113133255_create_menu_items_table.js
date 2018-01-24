/**
 * Create menu_items table.
 *
 * @param  {object} knex
 * @return {Promise}
 */
export function up(knex) {
  return knex.schema.createTable('menu_items', (table) => {
    table.increments();
    table
      .timestamp('created_at')
      .notNull()
      .defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNull();
    table
      .integer('menu_id')
      .references('id')
      .inTable('menus')
      .onDelete('CASCADE')
      .notNull();
    table.enu('type', ['normal_meal', 'vegetarian_meal', 'light_meal', 'special_meal', 'dessert', 'breakfast', 'lunch_time', 'information', 'price_information']).notNull();
    table.integer('weight').notNull().defaultTo(1);
  });
}

/**
 * Drop menu_items table.
 *
 * @param  {object} knex
 * @return {Promise}
 */
export function down(knex) {
  return knex.schema.dropTable('menu_items');
}
