import Knex from 'knex';
import { gql } from 'apollo-server-express';

import {
  Context,
  generateEnumSchema,
  generateEnumResolver,
} from '../utils/graphql';
import { normalizeDatabaseData } from '../utils/normalize';
import { getRestaurant } from './restaurant';

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
  SODEXO_IMPORTER = 'SodexoImporter',
  UNIRESTA_IMPORTER = 'UnirestaImporter',
}

export const getImportDetailsForRestaurant = async (
  db: Knex,
  restaurantId: number,
): Promise<ImportDetails[]> =>
  await db<ImportDetails>('import_details')
    .where('restaurant_id', restaurantId)
    .catch((): [] => []);

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

export const importDetailsTypeDefs = gql`
  enum ImporterType
  ${generateEnumSchema(ImporterType)}

  type ImportDetails {
    id: Int!
    type: ImporterType!
    identifier: String!
    language: String!
    enabled: Boolean!
    lastImportAt: Date
    createdAt: Date!
    updatedAt: Date!
    restaurant: Restaurant!
  }
`;

export const importDetailsResolvers = {
  ImportDetails: {
    restaurant: async (
      importDetails: { restaurantId: number },
      _: undefined,
      { db }: Context,
    ): Promise<object | undefined> => {
      const data = await getRestaurant(db, importDetails.restaurantId);

      if (data) {
        return normalizeDatabaseData(data);
      }
    },
  },
  ImporterType: generateEnumResolver(ImporterType),
};
