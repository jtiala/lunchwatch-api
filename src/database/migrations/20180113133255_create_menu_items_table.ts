import Knex from 'knex';

const menuItemTypes = [
  'normal_meal',
  'vegetarian_meal',
  'light_meal',
  'special_meal',
  'dessert',
  'breakfast',
  'lunch_time',
  'information',
  'price_information',
];

/**
 * Create menu_items table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const up = async (knex: Knex): Promise<void> =>
  await knex.schema.createTable('menu_items', (table): void => {
    table.increments();
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .integer('menu_id')
      .references('id')
      .inTable('menus')
      .onDelete('CASCADE')
      .notNullable();
    table.enu('type', menuItemTypes).notNullable();
    table
      .integer('weight')
      .notNullable()
      .defaultTo(1);
  });

/**
 * Drop menu_items table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> =>
  await knex.schema.dropTable('menu_items');
