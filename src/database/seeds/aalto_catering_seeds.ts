import Knex from 'knex';

const importer_type = 'AaltoCateringImporter';

/*
New additions (based on chain + name) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    chain: 'Aalto Catering',
    name: 'Automaatiotie',
    url: 'http://www.aaltocatering.fi/automaatiotielounas/',
    lat: 64.932362,
    lng: 25.385839,
    importDetails: [
      {
        importer_type,
        identifier: 'automaatiotielounas',
        language: 'fi',
      },
    ],
  },
  {
    chain: 'Aalto Catering',
    name: 'Lentokatu',
    url: 'http://www.aaltocatering.fi/lounaslentokatu/',
    lat: 64.930901,
    lng: 25.382341,
    importDetails: [
      {
        importer_type,
        identifier: 'lounaslentokatu',
        language: 'fi',
      },
    ],
  },
  {
    chain: 'Aalto Catering',
    name: 'Aapistie',
    url: 'http://www.aaltocatering.fi/lounasaapistie/',
    lat: 65.005516,
    lng: 25.527167,
    importDetails: [
      {
        importer_type,
        identifier: 'lounasaapistie',
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
          chain: restaurantData.chain,
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