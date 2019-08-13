import Knex from 'knex';

export interface ImportDetails {
  id: number;
  importer_type: ImporterType;
  identifier: string;
  language: string;
  enabled: boolean;
  last_import_at: Date;
  created_at: Date;
  updated_at: Date;
  restaurant_id: number;
}

export enum ImporterType {
  AMICA_IMPORTER = 'AmicaImporter',
  FAZER_FOOD_CO_IMPORTER = 'FazerFoodCoImporter',
  SODEXO_IMPORTER = 'SodexoImporter',
  UNIRESTA_IMPORTER = 'UnirestaImporter',
}

export const getEnabledImportDetails = async (
  db: Knex,
): Promise<ImportDetails[]> =>
  await db<ImportDetails>('import_details')
    .where('enabled', true)
    .catch((): [] => []);

export const updateLastImportAt = async (
  db: Knex,
  id: number,
): Promise<number> =>
  await db<ImportDetails>('import_details')
    .where('id', id)
    .update({ last_import_at: new Date() })
    .catch((): number => 0);
