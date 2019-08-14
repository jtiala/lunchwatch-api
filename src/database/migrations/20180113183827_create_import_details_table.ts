import Knex from 'knex';

import { ImporterType } from '../../importDetails/interfaces';

/**
 * Create imports table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const up = async (knex: Knex): Promise<void> =>
  await knex.schema.createTable('import_details', (table): void => {
    table.increments();
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table.timestamp('last_import_at');
    table.enu('importer_type', Object.values(ImporterType)).notNullable();
    table.string('identifier').notNullable();
    table
      .integer('restaurant_id')
      .references('id')
      .inTable('restaurants')
      .onDelete('CASCADE')
      .notNullable();
    table.string('language', 2).notNullable();
    table
      .boolean('enabled')
      .defaultTo(true)
      .notNullable();
  });

/**
 * Drop imports table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> =>
  await knex.schema.dropTable('import_details');
