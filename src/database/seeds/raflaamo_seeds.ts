import Knex from 'knex';

const importer_type = 'RaflaamoImporter';

/*
New additions (based on restaurants url) to this list will be added to the DB.
Removing or editing existing ones will not modify them.
*/
const restaurants = [
  {
    name: 'Amarillo',
    url: 'https://www.raflaamo.fi/fi/oulu/amarillo-oulu',
    lat: 65.012404,
    lng: 25.471878,
    importDetails: [
      {
        importer_type,
        identifier: 'oulu/amarillo-oulu/menu',
        language: 'fi',
      },
    ],
  },
  {
    name: 'Rosso',
    url: 'https://www.raflaamo.fi/fi/oulu/rosso-oulu',
    lat: 65.01159,
    lng: 25.471527,
    importDetails: [
      {
        importer_type,
        identifier: 'oulu/rosso-oulu/menu',
        language: 'fi',
      },
    ],
  },
  {
    name: 'Frans & Camille',
    url: 'https://www.raflaamo.fi/fi/oulu/frans-camille-oulu',
    lat: 65.012121,
    lng: 25.473005,
    importDetails: [
      {
        importer_type,
        identifier: 'oulu/frans-camille-oulu/menu',
        language: 'fi',
      },
    ],
  },
  {
    name: 'Puistokahvila Makia',
    url: 'https://www.raflaamo.fi/fi/oulu/puistokahvila-makia',
    lat: 65.012225,
    lng: 25.474158,
    importDetails: [
      {
        importer_type,
        identifier: 'oulu/puistokahvila-makia/menu',
        language: 'fi',
      },
    ],
  },
  {
    name: 'Grill it!',
    url: 'https://www.raflaamo.fi/fi/oulu/grill-it-oulu',
    lat: 65.010771,
    lng: 25.47363,
    importDetails: [
      {
        importer_type,
        identifier: 'oulu/grill-it-oulu/menu',
        language: 'fi',
      },
    ],
  },
  {
    name: 'Pizza & Buffa Limingantulli',
    url: 'https://www.raflaamo.fi/fi/oulu/pizza-buffa-limingantulli-oulu',
    lat: 64.993765,
    lng: 25.462514,
    importDetails: [
      {
        importer_type,
        identifier: 'oulu/pizza-buffa-limingantulli-oulu/menu',
        language: 'fi',
      },
    ],
  },
  {
    name: 'Pizza & Buffa Linnanmaa',
    url: 'https://www.raflaamo.fi/fi/oulu/pizza-buffa-linnanmaa-oulu',
    lat: 65.05457,
    lng: 25.456149,
    importDetails: [
      {
        importer_type,
        identifier: 'oulu/pizza-buffa-linnanmaa-oulu/menu',
        language: 'fi',
      },
    ],
  },
  {
    name: 'Ravintola Ara',
    url: 'https://www.raflaamo.fi/fi/oulu/ravintola-ara',
    lat: 65.027597,
    lng: 25.414441,
    importDetails: [
      {
        importer_type,
        identifier: 'oulu/ravintola-ara/menu',
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
