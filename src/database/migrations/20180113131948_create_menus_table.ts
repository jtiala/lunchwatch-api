import Knex from 'knex';

/**
 * Create menus table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const up = async (knex: Knex): Promise<void> =>
  await knex.schema.createTable('menus', (table): void => {
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
      .integer('restaurant_id')
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE')
      .notNullable();
    table.date('date').notNullable();
    table.string('language', 2).notNullable();
  });

/**
 * Drop menus table.
 *
 * @param  {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> =>
  await knex.schema.dropTable('menus');
