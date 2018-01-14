/* eslint-disable import/prefer-default-export */
/**
 * Seed imports table.
 *
 * @param  {object} knex
 * @param  {object} Promise
 * @return {Promise}
 */
export function seed(knex, Promise) {
  return knex('imports')
    .del()
    .then(() => Promise.all([
      knex('imports').insert([
        {
          updated_at: new Date(),
          importer: 'amicaImporter',
          identifier: '3498',
          restaurant_id: 1,
        },
        {
          updated_at: new Date(),
          importer: 'amicaImporter',
          identifier: '3497',
          restaurant_id: 2,
        },
        {
          updated_at: new Date(),
          importer: 'amicaImporter',
          identifier: '3587',
          restaurant_id: 3,
        },
        {
          updated_at: new Date(),
          importer: 'unirestaImporter',
          identifier: 'linnanmaa/kastari',
          restaurant_id: 4,
        },
      ]),
    ]));
}
