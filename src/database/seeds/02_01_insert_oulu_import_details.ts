import Knex from 'knex';

import { ImporterType } from '../../models/importDetails';

const unirestaImportDetails = [
  {
    restaurant_id: 10100,
    importer_type: ImporterType.UNIRESTA_IMPORTER,
    identifier: 'kastari',
    language: 'fi',
  },
  {
    restaurant_id: 10100,
    importer_type: ImporterType.UNIRESTA_IMPORTER,
    identifier: 'kastari',
    language: 'en',
  },
  {
    restaurant_id: 10101,
    importer_type: ImporterType.UNIRESTA_IMPORTER,
    identifier: 'vanilla',
    language: 'fi',
  },
  {
    restaurant_id: 10101,
    importer_type: ImporterType.UNIRESTA_IMPORTER,
    identifier: 'vanilla',
    language: 'en',
  },
  {
    restaurant_id: 10102,
    importer_type: ImporterType.UNIRESTA_IMPORTER,
    identifier: 'medisiina',
    language: 'fi',
  },
  {
    restaurant_id: 10102,
    importer_type: ImporterType.UNIRESTA_IMPORTER,
    identifier: 'medisiina',
    language: 'en',
  },
  {
    restaurant_id: 10103,
    importer_type: ImporterType.UNIRESTA_IMPORTER,
    identifier: 'preludi',
    language: 'fi',
  },
  {
    restaurant_id: 10103,
    importer_type: ImporterType.UNIRESTA_IMPORTER,
    identifier: 'preludi',
    language: 'en',
  },
  {
    restaurant_id: 10104,
    importer_type: ImporterType.UNIRESTA_IMPORTER,
    identifier: 'castanea',
    language: 'fi',
  },
  {
    restaurant_id: 10104,
    importer_type: ImporterType.UNIRESTA_IMPORTER,
    identifier: 'castanea',
    language: 'en',
  },
];
const amicaImportDetails = [
  {
    restaurant_id: 10200,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3498',
    language: 'fi',
  },
  {
    restaurant_id: 10200,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3498',
    language: 'en',
  },
  {
    restaurant_id: 10201,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3497',
    language: 'fi',
  },
  {
    restaurant_id: 10201,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3497',
    language: 'en',
  },
  {
    restaurant_id: 10202,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3587',
    language: 'fi',
  },
  {
    restaurant_id: 10202,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3587',
    language: 'en',
  },
  {
    restaurant_id: 10203,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '1694',
    language: 'fi',
  },
  {
    restaurant_id: 10203,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '1694',
    language: 'en',
  },
  {
    restaurant_id: 10204,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3511',
    language: 'fi',
  },
  {
    restaurant_id: 10204,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3511',
    language: 'en',
  },
  {
    restaurant_id: 10205,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0212',
    language: 'fi',
  },
  {
    restaurant_id: 10205,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0212',
    language: 'en',
  },
  {
    restaurant_id: 10206,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '811693',
    language: 'fi',
  },
  {
    restaurant_id: 10206,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '811693',
    language: 'en',
  },
  {
    restaurant_id: 10207,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0217',
    language: 'fi',
  },
  {
    restaurant_id: 10207,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0217',
    language: 'en',
  },
  {
    restaurant_id: 10208,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0226',
    language: 'fi',
  },
  {
    restaurant_id: 10208,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0226',
    language: 'en',
  },
  {
    restaurant_id: 10209,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '2532',
    language: 'fi',
  },
  {
    restaurant_id: 10209,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '2532',
    language: 'en',
  },
  {
    restaurant_id: 10210,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3508',
    language: 'fi',
  },
  {
    restaurant_id: 10210,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3508',
    language: 'en',
  },
  {
    restaurant_id: 10211,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0211',
    language: 'fi',
  },
  {
    restaurant_id: 10211,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0211',
    language: 'en',
  },
  {
    restaurant_id: 10212,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0235',
    language: 'fi',
  },
  {
    restaurant_id: 10212,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0235',
    language: 'en',
  },
  {
    restaurant_id: 10213,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3860',
    language: 'fi',
  },
  {
    restaurant_id: 10213,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '3860',
    language: 'en',
  },
  {
    restaurant_id: 10214,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0218',
    language: 'fi',
  },
  {
    restaurant_id: 10214,
    importer_type: ImporterType.AMICA_IMPORTER,
    identifier: '0218',
    language: 'en',
  },
];
const sodexoImportDetails = [
  {
    restaurant_id: 10300,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '12820',
    language: 'fi',
  },
  {
    restaurant_id: 10300,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '12820',
    language: 'en',
  },
  {
    restaurant_id: 10301,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '16',
    language: 'fi',
  },
  {
    restaurant_id: 10301,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '16',
    language: 'en',
  },
  {
    restaurant_id: 10302,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '49',
    language: 'fi',
  },
  {
    restaurant_id: 10302,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '49',
    language: 'en',
  },
  {
    restaurant_id: 10303,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '122',
    language: 'fi',
  },
  {
    restaurant_id: 10303,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '122',
    language: 'en',
  },
  {
    restaurant_id: 10304,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '8336',
    language: 'fi',
  },
  {
    restaurant_id: 10304,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '8336',
    language: 'en',
  },
  {
    restaurant_id: 10305,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '94',
    language: 'fi',
  },
  {
    restaurant_id: 10305,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '94',
    language: 'en',
  },
  {
    restaurant_id: 10306,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '39528',
    language: 'fi',
  },
  {
    restaurant_id: 10306,
    importer_type: ImporterType.SODEXO_IMPORTER,
    identifier: '39528',
    language: 'en',
  },
];
const antellImportDetails = [
  {
    enabled: false,
    restaurant_id: 10400,
    importer_type: ImporterType.ANTELL_IMPORTER,
    identifier: '300',
    language: 'fi',
  },
  {
    enabled: false,
    restaurant_id: 10401,
    importer_type: ImporterType.ANTELL_IMPORTER,
    identifier: '206',
    language: 'fi',
  },
  {
    enabled: false,
    restaurant_id: 10402,
    importer_type: ImporterType.ANTELL_IMPORTER,
    identifier: '65',
    language: 'fi',
  },
  {
    enabled: false,
    restaurant_id: 10403,
    importer_type: ImporterType.ANTELL_IMPORTER,
    identifier: '49',
    language: 'fi',
  },
  {
    enabled: false,
    restaurant_id: 10404,
    importer_type: ImporterType.ANTELL_IMPORTER,
    identifier: '336',
    language: 'fi',
  },
  {
    enabled: false,
    restaurant_id: 10405,
    importer_type: ImporterType.ANTELL_IMPORTER,
    identifier: '47',
    language: 'fi',
  },
  {
    enabled: false,
    restaurant_id: 10406,
    importer_type: ImporterType.ANTELL_IMPORTER,
    identifier: '356',
    language: 'fi',
  },
  {
    enabled: false,
    restaurant_id: 10407,
    importer_type: ImporterType.ANTELL_IMPORTER,
    identifier: '48',
    language: 'fi',
  },
  {
    enabled: false,
    restaurant_id: 10408,
    importer_type: ImporterType.ANTELL_IMPORTER,
    identifier: '66',
    language: 'fi',
  },
  {
    enabled: false,
    restaurant_id: 10409,
    importer_type: ImporterType.ANTELL_IMPORTER,
    identifier: '45',
    language: 'fi',
  },
];

/**
 * Seed imports table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const seed = async (knex: Knex): Promise<number[][]> =>
  await knex('import_details')
    .del()
    .then(
      (): Promise<number[][]> =>
        knex('import_details').insert([
          ...unirestaImportDetails,
          ...amicaImportDetails,
          ...sodexoImportDetails,
          ...antellImportDetails,
        ]),
    );
