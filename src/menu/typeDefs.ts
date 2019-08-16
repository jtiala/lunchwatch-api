import { gql } from 'apollo-server-express';

export default gql`
  type Menu {
    id: Int!
    language: String!
    date: Date!
    createdAt: Date!
    updatedAt: Date!
    restaurant: Restaurant!
    menuItems: [MenuItem]!
  }

  type MenuConnection {
    pageInfo: PageInfo!
    edges: [MenuEdge]!
    totalCount: Int!
  }

  type MenuEdge {
    cursor: String!
    node: Menu!
  }

  extend type Query {
    menu(id: Int!): Menu
    menus(
      date: Date
      language: String
      restaurantId: Int
      lat: Float
      lng: Float
      first: Int
      last: Int
      before: String
      after: String
      orderBy: String
      orderDirection: OrderDirection
    ): MenuConnection!
  }
`;
