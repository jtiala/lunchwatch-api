import { gql } from 'apollo-server-express';

export default gql`
  type Restaurant {
    id: Int!
    name: String!
    chain: String
    url: String
    lat: Float!
    lng: Float!
    enabled: Boolean!
    createdAt: Date!
    updatedAt: Date!
    menus: [Menu]!
    importDetails: [ImportDetails]!
    distance: Float
  }

  type RestaurantConnection {
    pageInfo: PageInfo!
    edges: [RestaurantEdge]!
    totalCount: Int!
  }

  type RestaurantEdge {
    cursor: String!
    node: Restaurant!
  }

  extend type Query {
    restaurant(id: Int!): Restaurant
    restaurants(
      chain: String
      enabled: Boolean
      lat: Float
      lng: Float
      first: Int
      last: Int
      before: String
      after: String
      orderBy: String
      orderDirection: OrderDirection
    ): RestaurantConnection!
  }
`;
