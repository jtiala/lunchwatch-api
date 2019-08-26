import Knex from 'knex';

const importer_type = 'HealthToOrganicImporter';

/*
New additions (based on restaurants url) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    chain: 'Health to Organic',
    name: 'H2O Cafe & Deli Keskusta',
    url: 'https://www.health2organic.fi/lounaslistat/keskusta.html',
    lat: 65.01139,
    lng: 25.474738,
    importDetails: [
      {
        importer_type,
        identifier: 'keskusta',
        language: 'fi',
      },
    ],
  },
  {
    chain: 'Health to Organic',
    name: 'H2O Cafe & Deli Kaleva',
    url: 'https://www.health2organic.fi/lounaslistat/kaleva.html',
    lat: 65.006093,
    lng: 25.47939,
    importDetails: [
      {
        importer_type,
        identifier: 'kaleva',
        language: 'fi',
      },
    ],
  },
  {
    chain: 'Health to Organic',
    name: 'H2O Cafe & Deli Ideapark',
    url: 'https://www.health2organic.fi/lounaslistat/ideapark.html',
    lat: 65.07739,
    lng: 25.447251,
    importDetails: [
      {
        importer_type,
        identifier: 'ideapark',
        language: 'fi',
      },
    ],
  },
  {
    chain: 'Health to Organic',
    name: 'H2O Cafe & Deli Campus',
    url: 'https://www.health2organic.fi/lounaslistat/campus.html',
    lat: 65.057658,
    lng: 25.46747,
    importDetails: [
      {
        importer_type,
        identifier: 'campus',
        language: 'fi',
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
