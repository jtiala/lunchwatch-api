import Knex from 'knex';

const importer_type = 'JuvenesImporter';

/*
New additions (based on chain + name) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    chain: 'Juvenes',
    name: 'Restaurant Foodoo',
    url: 'https://www.juvenes.fi/foodoo',
    lat: 65.0592409,
    lng: 25.4663717,
    importDetails: [
      {
        importer_type,
        identifier: '7097',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '7097',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Juvenes',
    name: 'Café Hub',
    url: 'https://www.juvenes.fi/hub',
    lat: 65.05873,
    lng: 25.4652391,
    importDetails: [
      {
        importer_type,
        identifier: '7098',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '7098',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Juvenes',
    name: 'Restaurant Napa',
    url: 'https://www.juvenes.fi/napa',
    lat: 65.0563701,
    lng: 25.4661188,
    importDetails: [
      {
        importer_type,
        identifier: '7099',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '7099',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Juvenes',
    name: 'Café TellUs',
    url: 'https://www.juvenes.fi/tellus',
    lat: 65.0589342,
    lng: 25.4661826,
    importDetails: [
      {
        importer_type,
        identifier: '7100',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '7100',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Juvenes',
    name: 'Restaurant Kylymä',
    url: 'https://www.juvenes.fi/kylyma',
    lat: 65.0596748,
    lng: 25.4677306,
    importDetails: [
      {
        importer_type,
        identifier: '7102',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '7102',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Juvenes',
    name: 'Restaurant Foobar',
    url: 'https://www.juvenes.fi/foobar',
    lat: 65.0597208,
    lng: 25.4652156,
    importDetails: [
      {
        importer_type,
        identifier: '7552',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '7552',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Juvenes',
    name: 'Café Juicebar',
    url: 'https://www.juvenes.fi/juicebar',
    lat: 65.05873,
    lng: 25.4652391,
    importDetails: [
      {
        importer_type,
        identifier: '8175',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '8175',
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
