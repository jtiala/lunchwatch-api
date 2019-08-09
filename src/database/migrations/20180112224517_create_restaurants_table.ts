import Knex from 'knex';

/**
 * Create restaurants table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const up = async (knex: Knex): Promise<void> =>
  await knex.schema.createTable('restaurants', (table): void => {
    table.increments();
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table.string('name').notNullable();
    table.string('chain');
    table.string('url');
    table.specificType('lat', 'float8').notNullable();
    table.specificType('lng', 'float8').notNullable();
    table
      .boolean('enabled')
      .defaultTo(true)
      .notNullable();
  });

/**
 * Drop restaurants table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> =>
  await knex.schema.dropTable('restaurants');
