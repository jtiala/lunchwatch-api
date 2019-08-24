export interface ImportDetails {
  id: number;
  importer_type: ImporterType;
  identifier: string;
  language: string;
  enabled: boolean;
  last_import_at?: Date;
  created_at: Date;
  updated_at: Date;
  restaurant_id: number;
}

export enum ImporterType {
  AMICA_IMPORTER = 'AmicaImporter',
  FAZER_FOOD_CO_IMPORTER = 'FazerFoodCoImporter',
  JUVENES_IMPORTER = 'JuvenesImporter',
  LA_TORREFAZIONE_IMPORTER = 'LaTorrefazioneImporter',
  SODEXO_IMPORTER = 'SodexoImporter',
  UNIRESTA_IMPORTER = 'UnirestaImporter',
}
