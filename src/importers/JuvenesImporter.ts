import fetch, { Response } from 'node-fetch';
import { getISOWeek, getQuarter, getYear, addYears, parseISO } from 'date-fns';
import { parseString } from 'xml2js';

import AbstractImporter from './AbstractImporter';
import { CreateMenuParams } from '../menu/interfaces';
import { deleteMenusForRestaurantForDate, createMenu } from '../menu/services';
import { CreateMenuItemParams, MenuItemType } from '../menuItem/interfaces';
import {
  CreateMenuItemComponentParams,
  MenuItemComponentType,
} from '../menuItemComponent/interfaces';
import { normalizeImportedString } from '../utils/normalize';

interface CreateMenuParamsPerDate {
  [index: string]: CreateMenuParams;
}

interface OptionMenuItem {
  Diets?: string;
  DisplayStyle?: number;
  HideInPrint?: boolean;
  Ingredients?: string;
  MenuItemID: string;
  Name?: string;
  Name_EN?: string;
  Name_FI?: string;
  Name_SV?: string;
  OrderNumber?: number;
  Price?: number;
}

interface MealOption {
  AlsoAvailable?: string;
  ExternalGroupId?: number;
  ExtraItems?: string;
  ForceMajeure?: string;
  MealOptionId?: number;
  MenuDate?: string;
  MenuItems?: OptionMenuItem[];
  Name?: string;
  Name_EN?: string;
  Name_FI?: string;
  Name_SV?: string;
  Price: number;
}

interface MenuData {
  AdditionalName?: string;
  KitchenName?: string;
  MealOptions?: MealOption[];
  MenuDateISO?: string;
  MenuId?: number;
  MenuTypeId?: number;
  MenuTypeName?: string;
  Name?: string;
  Week?: number;
  Weekday?: number;
}

interface AvailableMenu {
  KitchenId?: number;
  MenuId?: number;
  MenuTypeId?: number;
  Name?: string;
}

interface RestaurantInfo {
  d?: {
    Address?: string;
    AvailableMenus?: AvailableMenu[];
    Description?: string;
    OpenInfo?: {
      OpenInfoHtml?: string;
    };
  };
}

export default class JuvenesImporter extends AbstractImporter {
  public name = 'JuvenesImporter';

  protected getRestaurantUrl(identifier: string, language: string): string {
    return `https://www.juvenes.fi/DesktopModules/Talents.Restaurants/RestaurantsService.svc/GetRestaurant?restaurantId=${identifier}&lang=${language}`;
  }

  protected getMenuUrl(
    kitchenId: number,
    menuTypeId: number,
    week: number,
    language: string,
  ): string {
    return `https://www.juvenes.fi/DesktopModules/Talents.LunchMenu/LunchMenuServices.asmx/GetWeekMenu?kitchenId=${kitchenId}&menuTypeId=${menuTypeId}&week=${week}&lang=${language}`;
  }

  public async run(): Promise<void> {
    await fetch(
      this.getRestaurantUrl(
        this.importDetails.identifier,
        this.importDetails.language,
      ),
    )
      .then(
        async (response: Response): Promise<RestaurantInfo> => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }

          return (await response.json()) as Promise<RestaurantInfo>;
        },
      )
      .then(
        async (data: RestaurantInfo): Promise<void> =>
          await this.handleRestaurantInfo(data),
      );
  }

  private async handleRestaurantInfo(data: RestaurantInfo): Promise<void> {
    const createMenuParamsPerDate: CreateMenuParamsPerDate = {};

    if ('d' in data && typeof data.d === 'object') {
      let openingInfo: string | undefined;

      if (
        'OpenInfo' in data.d &&
        typeof data.d.OpenInfo === 'object' &&
        'OpenInfoHtml' in data.d.OpenInfo &&
        typeof data.d.OpenInfo.OpenInfoHtml === 'string'
      ) {
        openingInfo = normalizeImportedString(data.d.OpenInfo.OpenInfoHtml);
      }

      if (
        'AvailableMenus' in data.d &&
        Array.isArray(data.d.AvailableMenus) &&
        data.d.AvailableMenus.length
      ) {
        for (const availableMenu of data.d.AvailableMenus) {
          await this.handleAvailableMenu(
            availableMenu,
            createMenuParamsPerDate,
            openingInfo,
          );
        }
      }
    }

    for (const [date, createMenuParams] of Object.entries(
      createMenuParamsPerDate,
    )) {
      await deleteMenusForRestaurantForDate(
        this.db,
        this.importDetails.restaurant_id,
        this.importDetails.language,
        new Date(date),
      );

      if (
        Array.isArray(createMenuParams.menu_items) &&
        createMenuParams.menu_items.length
      ) {
        await createMenu(this.db, createMenuParams);
      }
    }
  }

  private async handleAvailableMenu(
    availableMenu: AvailableMenu,
    createMenuParamsPerDate: CreateMenuParamsPerDate,
    openingInfo: string | undefined,
  ): Promise<void> {
    if (
      typeof availableMenu.KitchenId === 'number' &&
      typeof availableMenu.MenuTypeId === 'number'
    ) {
      await fetch(
        this.getMenuUrl(
          availableMenu.KitchenId,
          availableMenu.MenuTypeId,
          getISOWeek(new Date()),
          this.importDetails.language,
        ),
      ).then(
        async (response: Response): Promise<void> => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }

          await response.text().then(async (text: string) => {
            await parseString(text, async (err, res) => {
              if (err) {
                throw new Error(String(err));
              }

              if (
                typeof res === 'object' &&
                'string' in res &&
                typeof res.string === 'object' &&
                '_' in res.string
              ) {
                const data = await JSON.parse(res.string._);
                this.parseCreateMenuParams(
                  data,
                  createMenuParamsPerDate,
                  openingInfo,
                );
              }
            });
          });
        },
      );
    }
  }

  private parseCreateMenuParams(
    data: MenuData[],
    createMenuParamsPerDate: {
      [index: string]: CreateMenuParams;
    },
    openingInfo: string | undefined,
  ): void {
    for (const item of data) {
      if (
        'Week' in item &&
        typeof item.Week === 'number' &&
        'Weekday' in item &&
        typeof item.Weekday === 'number' &&
        'MealOptions' in item &&
        Array.isArray(item.MealOptions) &&
        item.MealOptions.length
      ) {
        // Included MenuDateISO property seems to be invalid sometimes so we calculate our own date.
        // If current quarter is the last and menu's week is within the first 4 weeks of a year,
        // the menu must be for the next year.
        const year =
          [1, 2, 3, 4].includes(item.Week) && getQuarter(new Date()) === 4
            ? getYear(addYears(new Date(), 1))
            : getYear(new Date());

        const date = parseISO(`${year}-W${item.Week}-${item.Weekday}`);
        const dateString = date.toISOString();

        let name;
        let type = MenuItemType.NORMAL_MEAL;
        const menuItemComponents: CreateMenuItemComponentParams[] = [];

        for (const mealOption of item.MealOptions) {
          if (
            'MenuItems' in mealOption &&
            Array.isArray(mealOption.MenuItems) &&
            mealOption.MenuItems.length
          ) {
            for (const menuItem of mealOption.MenuItems) {
              if ('Name' in menuItem) {
                let value = String(menuItem.Name);

                if ('Diets' in menuItem) {
                  value = `${value} (${String(menuItem.Diets)})`;
                }

                const createMenuItemComponentParams: CreateMenuItemComponentParams = {
                  type: MenuItemComponentType.FOOD_ITEM,
                  value: normalizeImportedString(value),
                  weight:
                    typeof menuItem.OrderNumber === 'number'
                      ? menuItem.OrderNumber
                      : menuItemComponents.length + 1,
                };

                menuItemComponents.push(createMenuItemComponentParams);
              }
            }
          }
        }

        if (
          menuItemComponents.length &&
          'MenuTypeName' in item &&
          typeof item.MenuTypeName === 'string'
        ) {
          name = normalizeImportedString(item.MenuTypeName);
          type = JuvenesImporter.getMenuItemTypeFromString(
            name,
          ) as MenuItemType;
          menuItemComponents.push({
            type: MenuItemComponentType.NAME,
            value: name,
            weight: -2,
          });
        }

        if (menuItemComponents.length) {
          if (!(dateString in createMenuParamsPerDate)) {
            const createOpeningMenuItemParams:
              | CreateMenuItemParams
              | undefined = openingInfo
              ? {
                  weight: -1,
                  type: MenuItemType.LUNCH_TIME,
                  menu_item_components: [
                    {
                      type: MenuItemComponentType.LUNCH_TIME,
                      value: openingInfo,
                    },
                  ],
                }
              : undefined;

            const createMenuItemParams: CreateMenuItemParams = {
              weight: 1,
              type,
              menu_item_components: menuItemComponents,
            };

            createMenuParamsPerDate[dateString] = {
              date,
              language: this.importDetails.language,
              restaurant_id: this.importDetails.restaurant_id,
              menu_items: [
                ...(createOpeningMenuItemParams
                  ? [createOpeningMenuItemParams]
                  : []),
                createMenuItemParams,
              ],
            };
          } else {
            const createMenuItemParams: CreateMenuItemParams = {
              // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
              // @ts-ignorets-ignore
              weight: createMenuParamsPerDate[dateString].menu_items.length + 1,
              type,
              menu_item_components: menuItemComponents,
            };

            // This ts error is false, as we dynamically check existence
            // of createMenuParamsPerDate[dateString]
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignorets-ignore
            createMenuParamsPerDate[dateString].menu_items.push(
              createMenuItemParams,
            );
          }
        }
      }
    }
  }
}
