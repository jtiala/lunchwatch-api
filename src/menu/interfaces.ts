import Knex from 'knex';

import {
  Restaurant,
  RestaurantSearchConditions,
} from '../restaurant/interfaces';
import { MenuItem, CreateMenuItemParams } from '../menuItem/interfaces';

export interface Menu {
  id: number;
  date: Date;
  language: string;
  created_at: Date;
  updated_at: Date;
  restaurant_id: number;
  menu_items?: MenuItem[];
  restaurant?: Restaurant;
}

export interface CreateMenuParams {
  date: Date;
  language: string;
  restaurant_id: number;
  menu_items?: CreateMenuItemParams[];
}

export interface MenuSearchConditions {
  date?: Date;
  language?: string;
  restaurant_id?: number;
}

export interface MenuSearchParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns: (string | Knex.Raw<any>)[];
  conditions: MenuSearchConditions;
  restaurantConditions: RestaurantSearchConditions;
  order: string;
}
