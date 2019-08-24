import Knex from 'knex';

const importer_type = 'FazerFoodCoImporter';

/*
New additions (based on chain + name) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    chain: 'Fazer Food & Co.',
    name: 'Smarthouse',
    url:
      'https://www.fazerfoodco.fi/ravintolat/Ravintolat-kaupungeittain/oulu/smarthouse/',
    lat: 65.0606306,
    lng: 25.4395850999999,
    importDetails: [
      {
        importer_type,
        identifier: '3498',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '3498',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Fazer Food & Co.',
    name: 'Garden',
    url:
      'https://www.fazerfoodco.fi/ravintolat/Ravintolat-kaupungeittain/oulu/garden/',
    lat: 65.0597061,
    lng: 25.4579624,
    importDetails: [
      {
        importer_type,
        identifier: '3497',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '3497',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Fazer Food & Co.',
    name: 'Kantakortteli',
    url:
      'https://www.fazerfoodco.fi/ravintolat/Ravintolat-kaupungeittain/oulu/kantakortteli/',
    lat: 65.0089942,
    lng: 25.4701764,
    importDetails: [
      {
        importer_type,
        identifier: '1694',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '1694',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Fazer Food & Co.',
    name: 'Konnekti',
    url:
      'https://www.fazerfoodco.fi/ravintolat/Ravintolat-kaupungeittain/oulu/konnektitechnopolis/',
    lat: 65.008555,
    lng: 25.4693725,
    importDetails: [
      {
        importer_type,
        identifier: '3511',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '3511',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Fazer Food & Co.',
    name: 'Medusa',
    url:
      'https://www.fazerfoodco.fi/ravintolat/Ravintolat-kaupungeittain/oulu/medipolis--medusa/',
    lat: 65.0068205,
    lng: 25.5150452,
    importDetails: [
      {
        importer_type,
        identifier: '3508',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '3508',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Fazer Food & Co.',
    name: 'Stone',
    url:
      'https://www.fazerfoodco.fi/ravintolat/Ravintolat-kaupungeittain/oulu/stone/',
    lat: 65.0099509,
    lng: 25.5100324,
    importDetails: [
      {
        importer_type,
        identifier: '3509',
        language: 'fi',
      },
      {
        importer_type,
        identifier: '3509',
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
