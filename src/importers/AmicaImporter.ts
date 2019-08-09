import fetch, { Response } from 'node-fetch';
import { startOfWeek, addWeeks, format, parse } from 'date-fns';

import AbstractImporter from './AbstractImporter';
import {
  deleteMenusForRestaurantForDate,
  createMenu,
  CreateMenuParams,
} from '../models/menu';
import { CreateMenuItemParams, MenuItemType } from '../models/menuItem';
import {
  CreateMenuItemComponentParams,
  MenuItemComponentType,
} from '../models/menuItemComponent';
import { normalizeImportedString } from '../utils/normalize';

interface SetMenu {
  SortOrder?: number;
  Name?: string;
  Price?: string;
  Components?: string[];
}

interface MenuForDay {
  Date?: string;
  LunchTime?: string;
  SetMenus?: SetMenu[];
}

interface Data {
  MenusForDays?: MenuForDay[];
}

export default class AmicaImporter extends AbstractImporter {
  protected getUrl(identifier: string, language: string, date: Date): string {
    return `https://www.amica.fi/modules/json/json/Index?costNumber=${identifier}&language=${language}&firstDay=${format(
      date,
      'YYYY-MM-DD',
    )}`;
  }

  public async run(): Promise<void> {
    const thisMonday = startOfWeek(Date(), {
      weekStartsOn: 1,
    });
    const nextMonday = addWeeks(thisMonday, 1);

    for (const date of [thisMonday, nextMonday]) {
      await fetch(
        this.getUrl(
          this.importDetails.identifier,
          this.importDetails.language,
          date,
        ),
      )
        .then(
          async (response: Response): Promise<Data> => {
            if (!response.ok) {
              throw new Error(response.statusText);
            }

            return (await response.json()) as Promise<Data>;
          },
        )
        .then(async (data: Data): Promise<void> => await this.handleData(data));
    }
  }

  private async handleData(data: Data): Promise<void> {
    const parsedCreateMenuParamas = this.parseCreateMenuParams(data);

    for (const createMenuParams of parsedCreateMenuParamas) {
      await deleteMenusForRestaurantForDate(
        this.db,
        this.importDetails.restaurant_id,
        this.importDetails.language,
        createMenuParams.date,
      );

      if (
        Array.isArray(createMenuParams.menuItems) &&
        createMenuParams.menuItems.length
      ) {
        await createMenu(this.db, createMenuParams);
      }
    }
  }

  private parseCreateMenuParams(data: Data): CreateMenuParams[] {
    const parsedCreateMenuParamas: CreateMenuParams[] = [];

    if (
      'MenusForDays' in data &&
      Array.isArray(data.MenusForDays) &&
      data.MenusForDays.length
    ) {
      for (const menuData of data.MenusForDays) {
        if (
          'Date' in menuData &&
          typeof menuData.Date === 'string' &&
          menuData.Date.length
        ) {
          const date = parse(menuData.Date);
          parsedCreateMenuParamas.push(
            this.parseCreateMenuParamsForDay(menuData, date),
          );
        }
      }
    }

    return parsedCreateMenuParamas;
  }

  private parseCreateMenuParamsForDay(
    data: MenuForDay,
    date: Date,
  ): CreateMenuParams {
    const lunchTimeItem = this.parseLunchTimeItem(data);
    const menuItems = this.parseMenuItems(data);

    return {
      restaurant_id: this.importDetails.restaurant_id,
      language: this.importDetails.language,
      date,
      menuItems: [...(lunchTimeItem ? [lunchTimeItem] : []), ...menuItems],
    };
  }

  private parseLunchTimeItem(data: MenuForDay): CreateMenuItemParams | void {
    if (
      'LunchTime' in data &&
      typeof data.LunchTime === 'string' &&
      data.LunchTime.length
    ) {
      const value = normalizeImportedString(data.LunchTime);

      if (value.length) {
        const menuItemComponents: CreateMenuItemComponentParams[] = [
          {
            type: MenuItemComponentType.LUNCH_TIME,
            value,
          },
        ];

        return {
          type: MenuItemType.LUNCH_TIME,
          menuItemComponents,
          weight: -1,
        };
      }
    }
  }

  private parseMenuItems(data: MenuForDay): CreateMenuItemParams[] {
    const menuItems: CreateMenuItemParams[] = [];

    if (
      'SetMenus' in data &&
      Array.isArray(data.SetMenus) &&
      data.SetMenus.length
    ) {
      for (const [weight, setMenu] of data.SetMenus.entries()) {
        const menuItemComponents: CreateMenuItemComponentParams[] = [];

        const type = ('Name' in setMenu &&
        typeof setMenu.Name === 'string' &&
        setMenu.Name.length
          ? AmicaImporter.getMenuItemTypeFromString(setMenu.Name)
          : MenuItemType.NORMAL_MEAL) as MenuItemType;

        if (
          'Name' in setMenu &&
          typeof setMenu.Name === 'string' &&
          setMenu.Name.length
        ) {
          const value = normalizeImportedString(setMenu.Name);

          if (value.length) {
            menuItemComponents.push({
              type: MenuItemComponentType.NAME,
              value,
              weight: -2,
            });
          }
        }

        if (
          'Price' in setMenu &&
          typeof setMenu.Price === 'string' &&
          setMenu.Price.length
        ) {
          const value = normalizeImportedString(setMenu.Price);

          if (value.length) {
            menuItemComponents.push({
              type: MenuItemComponentType.PRICE_INFORMATION,
              value,
              weight: -1,
            });
          }
        }

        if (
          'Components' in setMenu &&
          Array.isArray(setMenu.Components) &&
          setMenu.Components.length
        ) {
          for (const [weight, component] of setMenu.Components.entries()) {
            const value = normalizeImportedString(component);

            if (value.length) {
              menuItemComponents.push({
                type: MenuItemComponentType.FOOD_ITEM,
                value,
                weight,
              });
            }
          }
        }

        menuItems.push({
          type,
          menuItemComponents,
          weight,
        });
      }
    }

    return menuItems;
  }
}
