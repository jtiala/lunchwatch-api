/* eslint-disable import/prefer-default-export */
/* eslint-disable object-curly-newline */
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
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3498', restaurant_id: 1, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3498', restaurant_id: 1, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3497', restaurant_id: 2, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3497', restaurant_id: 2, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3587', restaurant_id: 3, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3587', restaurant_id: 3, language: 'en' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'linnanmaa/kastari', restaurant_id: 4, language: 'fi' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'linnanmaa/kastari', restaurant_id: 4, language: 'en' },
      ]),
    ]));
}
