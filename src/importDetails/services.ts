import Knex from 'knex';

import { ImportDetails } from './interfaces';

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
