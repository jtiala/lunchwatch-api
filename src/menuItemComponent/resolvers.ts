import { MenuItemComponentType } from './interfaces';
import { generateEnumResolver } from '../utils/graphql';

export default {
  MenuItemComponentType: generateEnumResolver(MenuItemComponentType),
};
