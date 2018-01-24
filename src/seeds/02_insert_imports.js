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
        // Oulu / Uniresta
        { updated_at: new Date(), restaurant_id: 10100, importer: 'unirestaImporter', identifier: 'kastari', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10100, importer: 'unirestaImporter', identifier: 'kastari', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10101, importer: 'unirestaImporter', identifier: 'vanilla', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10101, importer: 'unirestaImporter', identifier: 'vanilla', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10102, importer: 'unirestaImporter', identifier: 'medisiina', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10102, importer: 'unirestaImporter', identifier: 'medisiina', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10103, importer: 'unirestaImporter', identifier: 'preludi', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10103, importer: 'unirestaImporter', identifier: 'preludi', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10104, importer: 'unirestaImporter', identifier: 'castanea', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10104, importer: 'unirestaImporter', identifier: 'castanea', language: 'en' },
        // Oulu / Amica
        { updated_at: new Date(), restaurant_id: 10200, importer: 'amicaImporter', identifier: '3498', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10200, importer: 'amicaImporter', identifier: '3498', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10201, importer: 'amicaImporter', identifier: '3497', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10201, importer: 'amicaImporter', identifier: '3497', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10202, importer: 'amicaImporter', identifier: '3587', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10202, importer: 'amicaImporter', identifier: '3587', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10203, importer: 'amicaImporter', identifier: '1694', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10203, importer: 'amicaImporter', identifier: '1694', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10204, importer: 'amicaImporter', identifier: '3511', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10204, importer: 'amicaImporter', identifier: '3511', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10205, importer: 'amicaImporter', identifier: '0212', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10205, importer: 'amicaImporter', identifier: '0212', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10206, importer: 'amicaImporter', identifier: '811693', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10206, importer: 'amicaImporter', identifier: '811693', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10207, importer: 'amicaImporter', identifier: '0217', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10207, importer: 'amicaImporter', identifier: '0217', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10208, importer: 'amicaImporter', identifier: '0226', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10208, importer: 'amicaImporter', identifier: '0226', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10209, importer: 'amicaImporter', identifier: '2532', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10209, importer: 'amicaImporter', identifier: '2532', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10210, importer: 'amicaImporter', identifier: '3508', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10210, importer: 'amicaImporter', identifier: '3508', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10211, importer: 'amicaImporter', identifier: '0211', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10211, importer: 'amicaImporter', identifier: '0211', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10212, importer: 'amicaImporter', identifier: '0235', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10212, importer: 'amicaImporter', identifier: '0235', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10213, importer: 'amicaImporter', identifier: '3860', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10213, importer: 'amicaImporter', identifier: '3860', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10214, importer: 'amicaImporter', identifier: '0218', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10214, importer: 'amicaImporter', identifier: '0218', language: 'en' },
        // Oulu / Sodexo
        { updated_at: new Date(), restaurant_id: 10300, importer: 'sodexoImporter', identifier: '12820', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10300, importer: 'sodexoImporter', identifier: '12820', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10301, importer: 'sodexoImporter', identifier: '16', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10301, importer: 'sodexoImporter', identifier: '16', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10302, importer: 'sodexoImporter', identifier: '49', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10302, importer: 'sodexoImporter', identifier: '49', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10303, importer: 'sodexoImporter', identifier: '122', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10303, importer: 'sodexoImporter', identifier: '122', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10304, importer: 'sodexoImporter', identifier: '8336', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10304, importer: 'sodexoImporter', identifier: '8336', language: 'en' },
        { updated_at: new Date(), restaurant_id: 10305, importer: 'sodexoImporter', identifier: '94', language: 'fi' },
        { updated_at: new Date(), restaurant_id: 10305, importer: 'sodexoImporter', identifier: '94', language: 'en' },
      ]),
    ]));
}
