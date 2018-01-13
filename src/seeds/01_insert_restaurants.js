/**
 * Seed restaurants table.
 * @param  {object} knex
 * @param  {object} Promise
 * @return {Promise}
 */
export default function seed(knex, Promise) {
  // Deletes all existing entries
  return knex('restaurants')
    .del()
    .then(() =>
      // Inserts seed entries
      Promise.all([
        knex('restaurants').insert([
          {
            name: 'Smarthouse',
            chain: 'Amica',
            url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/smarthouse/',
            updated_at: new Date(),
          },
          {
            name: 'Garden',
            chain: 'Amica',
            url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/teknologiantie-1/',
            updated_at: new Date(),
          },
          {
            name: 'VTT Oulu',
            chain: 'Amica',
            url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/vtt-oulu/',
            updated_at: new Date(),
          },
        ]),
      ]));
}
