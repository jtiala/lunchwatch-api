import Knex from 'knex';

/**
 * Description.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const up = async (knex: Knex): Promise<void> =>
  await knex.schema.createTable('table_name', (table): void => {
    table.increments();
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.raw('now()'));
    table.timestamp('updated_at').notNullable();
  });

/**
 * Description.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> =>
  await knex.schema.dropTable('table_name');
