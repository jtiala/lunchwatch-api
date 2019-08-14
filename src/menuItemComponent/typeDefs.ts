import { gql } from 'apollo-server-express';

import { MenuItemComponentType } from './interfaces';
import { generateEnumSchema } from '../utils/graphql';

export default gql`
  enum MenuItemComponentType
  ${generateEnumSchema(MenuItemComponentType)}

  type MenuItemComponent {
    id: Int!
    type: MenuItemComponentType!
    weight: Int!
    value: String
    createdAt: Date!
    updatedAt: Date!
    menuItem: MenuItem!
  }
`;
