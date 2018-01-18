/* eslint-disable import/prefer-default-export */
/* eslint-disable object-curly-newline */
/**
 * Seed restaurants table.
 *
 * @param  {object} knex
 * @param  {object} Promise
 * @return {Promise}
 */
export function seed(knex, Promise) {
  return knex('restaurants')
    .del()
    .then(() => Promise.all([
      knex('restaurants').insert([
        { updated_at: new Date(), id: 1, name: 'Smarthouse', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/smarthouse/', lat: '65.0606306', lng: '25.4395850999999' },
        { updated_at: new Date(), id: 2, name: 'Garden', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/teknologiantie-1/', lat: '65.0597061', lng: '25.4579624' },
        { updated_at: new Date(), id: 3, name: 'VTT Oulu', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/vtt-oulu/', lat: '65.0571932', lng: '25.4587494' },
        { updated_at: new Date(), id: 4, name: 'Kastari', chain: 'Uniresta', url: 'http://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/kastari.html', lat: '65.05724', lng: '25.467585' },
      ]),
    ]));
}
