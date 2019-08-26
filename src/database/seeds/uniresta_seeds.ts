import Knex from 'knex';

const importer_type = 'UnirestaImporter';

/*
New additions (based on chain + name) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    chain: 'Uniresta',
    name: 'Kastari',
    url:
      'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/kastari.html',
    lat: 65.05724,
    lng: 25.467585,
    importDetails: [
      {
        importer_type,
        identifier: 'kastari',
        language: 'fi',
      },
      {
        importer_type,
        identifier: 'kastari',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Uniresta',
    name: 'Vanilla',
    url:
      'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/vanilla.html',
    lat: 65.010636,
    lng: 25.465423,
    importDetails: [
      {
        importer_type,
        identifier: 'vanilla',
        language: 'fi',
      },
      {
        importer_type,
        identifier: 'vanilla',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Uniresta',
    name: 'Medisiina',
    url:
      'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/medisiina.html',
    lat: 65.007327,
    lng: 25.524053,
    importDetails: [
      {
        importer_type,
        identifier: 'medisiina',
        language: 'fi',
      },
      {
        importer_type,
        identifier: 'medisiina',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Uniresta',
    name: 'Preludi',
    url:
      'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/preludi.html',
    lat: 65.003095,
    lng: 25.479655,
    importDetails: [
      {
        importer_type,
        identifier: 'preludi',
        language: 'fi',
      },
      {
        importer_type,
        identifier: 'preludi',
        language: 'en',
      },
    ],
  },
  {
    chain: 'Uniresta',
    name: 'Castanea',
    url:
      'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/castanea.html',
    lat: 65.011072,
    lng: 25.511383,
    importDetails: [
      {
        importer_type,
        identifier: 'castanea',
        language: 'fi',
      },
      {
        importer_type,
        identifier: 'castanea',
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
