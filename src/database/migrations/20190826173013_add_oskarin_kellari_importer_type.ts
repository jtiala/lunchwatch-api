import Knex from 'knex';

const oldImporterTypes = [
  'AmicaImporter',
  'FazerFoodCoImporter',
  'SodexoImporter',
  'UnirestaImporter',
  'JuvenesImporter',
  'LaTorrefazioneImporter',
  'AaltoCateringImporter',
  'PitopalveluTimonenImporter',
  'RaflaamoImporter',
];

const newImporterTypes = [...oldImporterTypes, 'OskarinKellariImporter'];

/**
 * Alter import details: update importer type to include all types in ImporterType enum.
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
 * Delete all related restaurants.
 * Alter import details: remove new type from importer_type enum.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> => {
  await knex('restaurants')
    .where('url', 'like', '%oskarinkellari.com%')
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
