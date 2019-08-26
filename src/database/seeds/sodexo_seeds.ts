import Knex from 'knex';

const importer_type = 'SodexoImporter';

/*
New additions (based on restaurants url) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    chain: 'Sodexo',
    name: 'RE5T4UR4NT MYRSKY',
    url: 'https://www.sodexo.fi/technopolis-myrsky',
    lat: 65.012851,
    lng: 25.512647,
    importDetails: [
      {
        importer_type,
        identifier: '12820',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '12820',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Sodexo',
    name: 'Elektra',
    url: 'https://www.sodexo.fi/elektra',
    lat: 65.0599832,
    lng: 25.4450976,
    importDetails: [
      {
        importer_type,
        identifier: '16',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '16',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Sodexo',
    name: 'Galaksi',
    url: 'https://www.sodexo.fi/galaksi',
    lat: 65.057016,
    lng: 25.442629,
    importDetails: [
      {
        importer_type,
        identifier: '49',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '49',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Sodexo',
    name: 'Valo',
    url: 'https://www.sodexo.fi/valo',
    lat: 65.0591364,
    lng: 25.4385713,
    importDetails: [
      {
        importer_type,
        identifier: '39528',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '39528',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Sodexo',
    name: 'Louhi',
    url: 'https://www.sodexo.fi/louhi',
    lat: 65.058659,
    lng: 25.440705,
    importDetails: [
      {
        importer_type,
        identifier: '122',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '122',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Sodexo',
    name: 'Luoto',
    url: 'https://www.sodexo.fi/technopolis-luoto',
    lat: 65.013527,
    lng: 25.510581,
    importDetails: [
      {
        importer_type,
        identifier: '8336',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '8336',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Sodexo',
    name: 'Vihikari 10',
    url: 'https://www.sodexo.fi/lentokentantie',
    lat: 64.938935,
    lng: 25.445707,
    importDetails: [
      {
        importer_type,
        identifier: '94',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '94',
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
