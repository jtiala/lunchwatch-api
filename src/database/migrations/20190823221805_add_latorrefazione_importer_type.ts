import Knex from 'knex';

const oldImporterTypes = [
  'AmicaImporter',
  'FazerFoodCoImporter',
  'SodexoImporter',
  'UnirestaImporter',
  'JuvenesImporter',
];

const newImporterTypes = [...oldImporterTypes, 'LaTorrefazioneImporter'];

/**
 * Alter import details. Update importer type to include all types in ImporterType enum.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const up = async (knex: Knex): Promise<void> =>
  await knex.schema.raw(`
    ALTER TABLE "import_details"
    DROP CONSTRAINT "import_details_importer_type_check",
    ADD CONSTRAINT "import_details_importer_type_check"
    CHECK (importer_type IN (${newImporterTypes
      .map((val) => `'${val}'`)
      .join(', ')}))
  `);

/**
 * Delete all La Torrefazione restaurants.
 * Alter import details: remove LaTorrefazioneImporter from importer_type enum.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> => {
  await knex('restaurants')
    .where('name', 'La Torrefazione')
    .delete();

  await knex.schema.raw(`
    ALTER TABLE "import_details"
    DROP CONSTRAINT "import_details_importer_type_check",
    ADD CONSTRAINT "import_details_importer_type_check"
    CHECK (importer_type IN (${oldImporterTypes
      .map((val) => `'${val}'`)
      .join(', ')}))
  `);
};
