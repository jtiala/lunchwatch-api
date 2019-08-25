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
  schedule?: string,
): Promise<ImportDetails[]> => {
  const conditions: { enabled: boolean; schedule?: string } = {
    enabled: true,
  };

  if (schedule) {
    conditions['schedule'] = schedule;
  }

  return await db<ImportDetails>('import_details')
    .where(conditions)
    .catch((): [] => []);
};

export const getSchedules = async (db: Knex): Promise<{ schedule: string }[]> =>
  await db<{ schedule: string }>('import_details')
    .distinct('schedule')
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
