import Knex from 'knex';
import { ImporterType } from '../../importDetails/interfaces';

/**
 * Alter import details. Add JuvenesImporter to importer_type enum.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const up = async (knex: Knex): Promise<void> =>
  await knex.schema.raw(`
    ALTER TABLE "import_details"
    DROP CONSTRAINT "import_details_importer_type_check",
    ADD CONSTRAINT "import_details_importer_type_check"
    CHECK (importer_type IN (${Object.values(ImporterType)
      .map((val) => `'${val}'`)
      .join(', ')}))
  `);

/**
 * Delete all Juvenes restaurants.
 * Alter import details: remove JuvenesImporter from importer_type enum.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> => {
  await knex('restaurants')
    .where('chain', 'Juvenes')
    .delete();

  await knex.schema.raw(`
    ALTER TABLE "import_details"
    DROP CONSTRAINT "import_details_importer_type_check",
    ADD CONSTRAINT "import_details_importer_type_check"
    CHECK (importer_type IN (${Object.values(ImporterType)
      .filter((val) => val !== ImporterType.JUVENES_IMPORTER)
      .map((val) => `'${val}'`)
      .join(', ')}))
  `);
};
