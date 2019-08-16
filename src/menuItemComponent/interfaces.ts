export interface MenuItemComponent {
  id: number;
  type: MenuItemComponentType;
  value: string;
  weight: number;
  created_at: Date;
  updated_at: Date;
  menu_item_id: number;
}

export enum MenuItemComponentType {
  FOOD_ITEM = 'food_item',
  NAME = 'name',
  LUNCH_TIME = 'lunch_time',
  INFORMATION = 'information',
  PRICE_INFORMATION = 'price_information',
}

export interface CreateMenuItemComponentParams {
  type?: MenuItemComponentType;
  value?: string;
  weight?: number;
  menu_item_id?: number;
}
