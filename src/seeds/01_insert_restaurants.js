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
        { updated_at: new Date(), id: 1, name: 'Kastari', chain: 'Uniresta', url: 'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/kastari.html', lat: '65.05724', lng: '25.467585' },
        { updated_at: new Date(), id: 2, name: 'Vanilla', chain: 'Uniresta', url: 'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/vanilla.html', lat: '65.010636', lng: '25.465423' },
        { updated_at: new Date(), id: 3, name: 'Medisiina', chain: 'Uniresta', url: 'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/medisiina.html', lat: '65.007327', lng: '25.524053' },
        { updated_at: new Date(), id: 4, name: 'Preludi', chain: 'Uniresta', url: 'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/preludi.html', lat: '65.003095', lng: '25.479655' },
        { updated_at: new Date(), id: 5, name: 'Castanea', chain: 'Uniresta', url: 'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/castanea.html', lat: '65.011072', lng: '25.511383' },
        { updated_at: new Date(), id: 6, name: 'Smarthouse', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/smarthouse/', lat: '65.0606306', lng: '25.4395850999999' },
        { updated_at: new Date(), id: 7, name: 'Garden', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/teknologiantie-1/', lat: '65.0597061', lng: '25.4579624' },
        { updated_at: new Date(), id: 8, name: 'VTT Oulu', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/vtt-oulu/', lat: '65.0571932', lng: '25.4587494' },
        { updated_at: new Date(), id: 9, name: 'ODL Kantakortteli', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/odl-kantakortteli/', lat: '65.0089942', lng: '25.4701764' },
        { updated_at: new Date(), id: 10, name: 'Konnekti', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/konnektitechnopolis/', lat: '65.008555', lng: '25.4693725' },
        { updated_at: new Date(), id: 11, name: 'Pykälä', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/oulun-oikeus--ja-poliisitalo--pykala/', lat: '65.010513', lng: '25.4852289' },
        { updated_at: new Date(), id: 12, name: 'Vesper-koti', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/odl-vesperkoti/', lat: '65.0032975', lng: '25.4601201' },
        { updated_at: new Date(), id: 13, name: 'Wallu', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/wallu/', lat: '65.0066361', lng: '25.4901111' },
        { updated_at: new Date(), id: 14, name: 'Alwari', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/alwari/', lat: '65.0093011', lng: '25.5112750000001' },
        { updated_at: new Date(), id: 15, name: 'Majakka', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/majakka/', lat: '65.0130135', lng: '25.5129067' },
        { updated_at: new Date(), id: 16, name: 'Medusa', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/medipolis--medusa/', lat: '65.0068205', lng: '25.5150452' },
        { updated_at: new Date(), id: 17, name: 'Tielläpitäjä', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/tiellapitaja--raskone-oy/', lat: '65.043714', lng: '25.5473154' },
        { updated_at: new Date(), id: 18, name: 'Kotkanpoika & Kulturelli', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/kotkanpoika/', lat: '64.999626', lng: '25.5106401' },
        { updated_at: new Date(), id: 19, name: 'Amicast', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/amikast/', lat: '65.0071551', lng: '25.5275468' },
        { updated_at: new Date(), id: 20, name: 'Fasaani', chain: 'Amica', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/fasaani/', lat: '64.999626', lng: '25.5106401' },
      ]),
    ]));
}
