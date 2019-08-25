import Knex from 'knex';

const importer_type = 'PitopalveluTimonenImporter';

/*
New additions (based on chain + name) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    name: 'Aeroport',
    url: 'https://pitopalvelutimonen.fi/aeroport-lounasravintola-oulunsalo/',
    lat: 64.931588,
    lng: 25.386748,
    importDetails: [
      {
        importer_type,
        identifier: 'aeroport-lounasravintola-oulunsalo',
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
