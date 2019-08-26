import Knex from 'knex';

const importer_type = 'AmicaImporter';

/*
New additions (based on chain + name) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    chain: 'Amica',
    name: 'ODL Vesper-koti',
    url:
      'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/odl-vesperkoti/',
    lat: 65.0032975,
    lng: 25.4601201,
    importDetails: [
      {
        importer_type,
        identifier: '1693',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '1693',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Amica',
    name: 'Wallu',
    url:
      'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/wallu/',
    lat: 65.0066361,
    lng: 25.4901111,
    importDetails: [
      {
        importer_type,
        identifier: '0217',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '0217',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Amica',
    name: 'Alwari',
    url:
      'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/alwari/',
    lat: 65.0093011,
    lng: 25.5112750000001,
    importDetails: [
      {
        importer_type,
        identifier: '0226',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '0226',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Amica',
    name: 'Majakka',
    url:
      'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/majakka/',
    lat: 65.0130135,
    lng: 25.5129067,
    importDetails: [
      {
        importer_type,
        identifier: '2532',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '2532',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Amica',
    name: 'Kotkanpoika & Kulturelli',
    url:
      'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/kotkanpoika/',
    lat: 64.999626,
    lng: 25.5106401,
    importDetails: [
      {
        importer_type,
        identifier: '0235',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '0235',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Amica',
    name: 'Fasaani',
    url:
      'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/fasaani/',
    lat: 64.999626,
    lng: 25.5106401,
    importDetails: [
      {
        importer_type,
        identifier: '0218',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '0218',
        language: 'en',
      },
    ],
  },
];

/**
 * Seed restaurants and import details.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const seed = async (knex: Knex): Promise<void> =>
  await knex('restaurants').then(
    async (): Promise<void> => {
      for (const restaurantData of restaurants) {
        const foundRestaurants = await knex('restaurants').where({
          url: restaurantData.url,
        });

        if (!foundRestaurants.length) {
          const { importDetails, ...restaurantDetails } = restaurantData;
          const insertedIds = await knex('restaurants')
            .insert(restaurantDetails)
            .returning('id');

          if (insertedIds[0] && Array.isArray(importDetails)) {
            for (const importDetail of importDetails) {
              await knex('import_details').insert({
                restaurant_id: insertedIds[0],
                ...importDetail,
              });
            }
          }
        }
      }
    },
  );
