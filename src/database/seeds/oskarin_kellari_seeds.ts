import Knex from 'knex';

const importer_type = 'OskarinKellariImporter';
const schedule = [
  '0 6-8 * * 1', // On mon, run at 6:00, 7:00 and 8:00 GMT
  '0 6 * * 2-5', // On tue-fri, run at 6:00 AM GMT
].join(';');

/*
New additions (based on restaurants url) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    name: 'Oskarin Kellari',
    url: 'http://www.oskarinkellari.com',
    lat: 65.011404,
    lng: 25.474713,
    importDetails: [
      {
        importer_type,
        schedule,
        identifier: '3',
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
