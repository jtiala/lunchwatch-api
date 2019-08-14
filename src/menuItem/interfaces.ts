import {
  MenuItemComponent,
  CreateMenuItemComponentParams,
} from '../menuItemComponent/interfaces';

export interface MenuItem {
  id: number;
  type: MenuItemType;
  weight: number;
  created_at: Date;
  updated_at: Date;
  menu_id: number;
  menu_item_components?: MenuItemComponent[];
}

export enum MenuItemType {
  NORMAL_MEAL = 'normal_meal',
  VEGETARIAN_MEAL = 'vegetarian_meal',
  LIGHT_MEAL = 'light_meal',
  SPECIAL_MEAL = 'special_meal',
  DESSERT = 'dessert',
  BREAKFAST = 'breakfast',
  LUNCH_TIME = 'lunch_time',
  INFORMATION = 'information',
  PRICE_INFORMATION = 'price_information',
}

export interface CreateMenuItemParams {
  type?: MenuItemType;
  weight?: number;
  menu_id?: number;
  menu_item_components?: CreateMenuItemComponentParams[];
}
