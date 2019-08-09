import Knex from 'knex';

export interface ImportDetails {
  id: number;
  created_at: Date;
  updated_at: Date;
  last_import_at: Date;
  importer_type: ImporterType;
  identifier: string;
  restaurant_id: number;
  language: string;
  enabled: boolean;
}

export enum ImporterType {
  UNIRESTA_IMPORTER = 'UnirestaImporter',
  AMICA_IMPORTER = 'AmicaImporter',
  SODEXO_IMPORTER = 'SodexoImporter',
  ANTELL_IMPORTER = 'AntellImporter',
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
