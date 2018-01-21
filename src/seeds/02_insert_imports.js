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
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'kastari', restaurant_id: 1, language: 'fi' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'kastari', restaurant_id: 1, language: 'en' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'vanilla', restaurant_id: 2, language: 'fi' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'vanilla', restaurant_id: 2, language: 'en' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'medisiina', restaurant_id: 3, language: 'fi' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'medisiina', restaurant_id: 3, language: 'en' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'preludi', restaurant_id: 4, language: 'fi' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'preludi', restaurant_id: 4, language: 'en' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'castanea', restaurant_id: 5, language: 'fi' },
        { updated_at: new Date(), importer: 'unirestaImporter', identifier: 'castanea', restaurant_id: 5, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3498', restaurant_id: 6, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3498', restaurant_id: 6, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3497', restaurant_id: 7, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3497', restaurant_id: 7, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3587', restaurant_id: 8, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3587', restaurant_id: 8, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '1694', restaurant_id: 9, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '1694', restaurant_id: 9, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3511', restaurant_id: 10, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3511', restaurant_id: 10, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0212', restaurant_id: 11, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0212', restaurant_id: 11, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '811693', restaurant_id: 12, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '811693', restaurant_id: 12, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0217', restaurant_id: 13, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0217', restaurant_id: 13, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0226', restaurant_id: 14, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0226', restaurant_id: 14, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '2532', restaurant_id: 15, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '2532', restaurant_id: 15, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3508', restaurant_id: 16, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3508', restaurant_id: 16, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0211', restaurant_id: 17, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0211', restaurant_id: 17, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0235', restaurant_id: 18, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0235', restaurant_id: 18, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3860', restaurant_id: 19, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '3860', restaurant_id: 19, language: 'en' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0218', restaurant_id: 20, language: 'fi' },
        { updated_at: new Date(), importer: 'amicaImporter', identifier: '0218', restaurant_id: 20, language: 'en' },
      ]),
    ]));
}
