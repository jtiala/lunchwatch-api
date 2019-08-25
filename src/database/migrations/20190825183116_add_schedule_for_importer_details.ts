import Knex from 'knex';

const schedule = [
  '0 6 * * 1', // On mon, run at 6:00 GMT
  '0 4 * * 2-7', // On tue-sun, run at 4:00 AM GMT
].join(';');

/**
 * Alter import details. Add schedule column.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const up = async (knex: Knex): Promise<void> =>
  await knex.schema.alterTable('import_details', (table): void => {
    table
      .string('schedule')
      .defaultTo(schedule)
      .notNullable();
  });

/**
 * Alter import details. Drop schedule column.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> =>
  await knex.schema.alterTable('import_details', (table): void => {
    table.dropColumn('schedule');
  });
