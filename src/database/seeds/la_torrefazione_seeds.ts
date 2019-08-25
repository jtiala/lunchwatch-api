import Knex from 'knex';

const importer_type = 'LaTorrefazioneImporter';

/*
New additions (based on name + url) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    name: 'La Torrefazione',
    url: 'http://www.latorre.fi/toimipiste/valkea',
    lat: 65.011429,
    lng: 25.472034,
    importDetails: [
      {
        importer_type,
        identifier: 'valkea',
        language: 'fi',
      },
      {
        importer_type,
        identifier: 'valkea',
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
          name: restaurantData.name,
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
