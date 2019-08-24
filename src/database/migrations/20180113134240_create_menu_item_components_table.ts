import Knex from 'knex';

const menuItemComponentTypes = [
  'food_item',
  'name',
  'lunch_time',
  'information',
  'price_information',
];

/**
 * Create menu_item_components table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const up = async (knex: Knex): Promise<void> =>
  await knex.schema.createTable('menu_item_components', (table): void => {
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
      .integer('menu_item_id')
      .references('id')
      .inTable('menu_items')
      .onDelete('CASCADE')
      .notNullable();
    table.enu('type', menuItemComponentTypes).notNullable();
    table.text('value').notNullable();
    table
      .integer('weight')
      .notNullable()
      .defaultTo(1);
  });

/**
 * Create menu_item_components table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> =>
  await knex.schema.dropTable('menu_item_components');
