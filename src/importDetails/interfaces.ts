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
  schedule?: string;
}

export enum ImporterType {
  AMICA_IMPORTER = 'AmicaImporter',
  FAZER_FOOD_CO_IMPORTER = 'FazerFoodCoImporter',
  SODEXO_IMPORTER = 'SodexoImporter',
  UNIRESTA_IMPORTER = 'UnirestaImporter',
  JUVENES_IMPORTER = 'JuvenesImporter',
  LA_TORREFAZIONE_IMPORTER = 'LaTorrefazioneImporter',
  AALTO_CATERING_IMPORTER = 'AaltoCateringImporter',
  PITOPALVELU_TIMONEN_IMPORTER = 'PitopalveluTimonenImporter',
  RAFLAAMO_IMPORTER = 'RaflaamoImporter',
  OSKARIN_KELLARI_IMPORTER = 'OskarinKellariImporter',
  HEALTH_TO_ORGANIC_IMPORTER = 'HealthToOrganicImporter',
}
