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
        // Oulu / Uniresta
        { updated_at: new Date(), id: 10100, chain: 'Uniresta', name: 'Kastari', url: 'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/kastari.html', lat: '65.05724', lng: '25.467585' },
        { updated_at: new Date(), id: 10101, chain: 'Uniresta', name: 'Vanilla', url: 'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/vanilla.html', lat: '65.010636', lng: '25.465423' },
        { updated_at: new Date(), id: 10102, chain: 'Uniresta', name: 'Medisiina', url: 'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/medisiina.html', lat: '65.007327', lng: '25.524053' },
        { updated_at: new Date(), id: 10103, chain: 'Uniresta', name: 'Preludi', url: 'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/preludi.html', lat: '65.003095', lng: '25.479655' },
        { updated_at: new Date(), id: 10104, chain: 'Uniresta', name: 'Castanea', url: 'https://www.uniresta.fi/lounasravintolat/kaikki-ravintolat/castanea.html', lat: '65.011072', lng: '25.511383' },
        // Oulu / Amica
        { updated_at: new Date(), id: 10200, chain: 'Amica', name: 'Smarthouse', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/smarthouse/', lat: '65.0606306', lng: '25.4395850999999' },
        { updated_at: new Date(), id: 10201, chain: 'Amica', name: 'Garden', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/teknologiantie-1/', lat: '65.0597061', lng: '25.4579624' },
        { updated_at: new Date(), id: 10202, chain: 'Amica', name: 'VTT Oulu', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/vtt-oulu/', lat: '65.0571932', lng: '25.4587494' },
        { updated_at: new Date(), id: 10203, chain: 'Amica', name: 'ODL Kantakortteli', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/odl-kantakortteli/', lat: '65.0089942', lng: '25.4701764' },
        { updated_at: new Date(), id: 10204, chain: 'Amica', name: 'Konnekti', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/konnektitechnopolis/', lat: '65.008555', lng: '25.4693725' },
        { updated_at: new Date(), id: 10205, chain: 'Amica', name: 'Pykälä', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/oulun-oikeus--ja-poliisitalo--pykala/', lat: '65.010513', lng: '25.4852289' },
        { updated_at: new Date(), id: 10206, chain: 'Amica', name: 'Vesper-koti', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/odl-vesperkoti/', lat: '65.0032975', lng: '25.4601201' },
        { updated_at: new Date(), id: 10207, chain: 'Amica', name: 'Wallu', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/wallu/', lat: '65.0066361', lng: '25.4901111' },
        { updated_at: new Date(), id: 10208, chain: 'Amica', name: 'Alwari', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/alwari/', lat: '65.0093011', lng: '25.5112750000001' },
        { updated_at: new Date(), id: 10209, chain: 'Amica', name: 'Majakka', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/majakka/', lat: '65.0130135', lng: '25.5129067' },
        { updated_at: new Date(), id: 10210, chain: 'Amica', name: 'Medusa', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/medipolis--medusa/', lat: '65.0068205', lng: '25.5150452' },
        { updated_at: new Date(), id: 10211, chain: 'Amica', name: 'Tielläpitäjä', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/tiellapitaja--raskone-oy/', lat: '65.043714', lng: '25.5473154' },
        { updated_at: new Date(), id: 10212, chain: 'Amica', name: 'Kotkanpoika & Kulturelli', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/kotkanpoika/', lat: '64.999626', lng: '25.5106401' },
        { updated_at: new Date(), id: 10213, chain: 'Amica', name: 'Amicast', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/amikast/', lat: '65.0071551', lng: '25.5275468' },
        { updated_at: new Date(), id: 10214, chain: 'Amica', name: 'Fasaani', url: 'https://www.amica.fi/ravintolat/ravintolat-kaupungeittain/oulu/fasaani/', lat: '64.999626', lng: '25.5106401' },
        // Oulu / Sodexo
        { updated_at: new Date(), id: 10300, chain: 'Sodexo', name: 'RE5T4UR4NT MYRSKY', url: 'https://www.sodexo.fi/technopolis-myrsky', lat: '65.012851', lng: '25.512647' },
        { updated_at: new Date(), id: 10301, chain: 'Sodexo', name: 'Elektra', url: 'https://www.sodexo.fi/elektra', lat: '65.0599832', lng: '25.4450976' },
        { updated_at: new Date(), id: 10302, chain: 'Sodexo', name: 'Galaksi', url: 'https://www.sodexo.fi/technopolis-oulu-linnanmaa', lat: '65.057016', lng: '25.442629' },
        { updated_at: new Date(), id: 10303, chain: 'Sodexo', name: 'Technopolis Oulu, Kahvila', url: 'https://www.sodexo.fi/technopolis/kahvila', lat: '65.058659', lng: '25.440705' },
        { updated_at: new Date(), id: 10304, chain: 'Sodexo', name: 'Luoto', url: 'https://www.sodexo.fi/technopolis-luoto', lat: '65.013527', lng: '25.510581' },
        { updated_at: new Date(), id: 10305, chain: 'Sodexo', name: 'Lentokentäntie', url: 'https://www.sodexo.fi/technopolis-lentokentantie', lat: '64.938935', lng: '25.445707' },
      ]),
    ]));
}
