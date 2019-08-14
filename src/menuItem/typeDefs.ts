import { gql } from 'apollo-server-express';

import { MenuItemType } from './interfaces';
import { generateEnumSchema } from '../utils/graphql';

export default gql`
  enum MenuItemType
  ${generateEnumSchema(MenuItemType)}

  type MenuItem {
    id: Int!
    type: MenuItemType!
    weight: Int!
    createdAt: Date!
    updatedAt: Date!
    menu: Menu!
    menuItemComponents: [MenuItemComponent]!
  }
`;
