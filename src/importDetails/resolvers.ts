import { ImporterType } from './interfaces';
import { Restaurant } from '../restaurant/interfaces';
import { Context, generateEnumResolver } from '../utils/graphql';
import { normalizeDatabaseData } from '../utils/normalize';

const restaurantFieldResover = async (
  { restaurantId }: { restaurantId: number },
  _: undefined,
  { db }: Context,
): Promise<object | undefined> => {
  const data = await db<Restaurant>('restaurants').where('id', restaurantId);

  if (data) {
    return normalizeDatabaseData(data[0]);
  }
};

export default {
  ImportDetails: {
    restaurant: restaurantFieldResover,
  },
  ImporterType: generateEnumResolver(ImporterType),
};
