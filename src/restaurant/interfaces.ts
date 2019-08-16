import Knex from 'knex';
import { Menu } from '../menu/interfaces';

export interface Restaurant {
  id: number;
  name: string;
  chain?: string;
  url?: string;
  lat: number;
  lng: number;
  enabled: boolean;
  created_at: Date;
  updated_at: Date;
  menus?: Menu[];
  distance?: number;
}

export interface RestaurantSearchConditions {
  chain?: string;
  enabled?: boolean;
}

export interface RestaurantSearchParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: (string | Knex.Raw<any>)[];
  conditions: RestaurantSearchConditions;
  order: string;
}
