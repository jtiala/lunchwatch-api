import Knex from 'knex';
import PQueue from 'p-queue';
import { Logger } from 'winston';
import fetch, { Response } from 'node-fetch';
import { startOfWeek, addWeeks, format, addDays } from 'date-fns';

import AbstractImporter from './AbstractImporter';
import { CreateMenuParams } from '../menu/interfaces';
import { deleteMenusForRestaurantForDate, createMenu } from '../menu/services';
import { CreateMenuItemParams, MenuItemType } from '../menuItem/interfaces';
import {
  CreateMenuItemComponentParams,
  MenuItemComponentType,
} from '../menuItemComponent/interfaces';
import { ImportDetails } from '../importDetails/interfaces';
import { normalizeImportedString } from '../utils/normalize';

type TitleKey = 'title_fi' | 'title_en';
type DescKey = 'desc_fi' | 'desc_en';

interface MenuRow {
  title_fi?: string;
  title_en?: string;
  desc_fi?: string;
  desc_en?: string;
  properties?: string;
  price?: string;
}

interface Menus {
  [key: string]: MenuRow[];
}

interface Data {
  menus?: Menus;
}

interface ParsedDay {
  menu: CreateMenuParams;
  menuItems: CreateMenuItemParams[];
}

export default class SodexoImporter extends AbstractImporter {
  private titleKey: TitleKey;
  private descKey: DescKey;

  public constructor(
    importDetails: ImportDetails,
    db: Knex,
    queue: PQueue,
    logger: Logger,
  ) {
    super(importDetails, db, queue, logger);

    this.titleKey = importDetails.language === 'fi' ? 'title_fi' : 'title_en';
    this.descKey = importDetails.language === 'fi' ? 'desc_fi' : 'desc_en';
  }

  protected getUrl(identifier: string, language: string, date: Date): string {
    return `https://www.sodexo.fi/ruokalistat/output/weekly_json/${identifier}/${format(
      date,
      'YYYY/MM/DD',
    )}/${language}`;
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
        .then(
          async (data: Data): Promise<void> =>
            await this.handleData(data, date),
        );
    }
  }

  private async handleData(data: Data, firstDate: Date): Promise<void> {
    const parsedCreateMenuParamas = this.parseCreateMenuParams(data, firstDate);

    for (const createMenuParams of parsedCreateMenuParamas) {
      await deleteMenusForRestaurantForDate(
        this.db,
        this.importDetails.restaurant_id,
        this.importDetails.language,
        createMenuParams.date,
      );

      if (
        Array.isArray(createMenuParams.menu_items) &&
        createMenuParams.menu_items.length
      ) {
        await createMenu(this.db, createMenuParams);
      }
    }
  }

  private parseCreateMenuParams(
    data: Data,
    firstDate: Date,
  ): CreateMenuParams[] {
    const parsedCreateMenuParamas: CreateMenuParams[] = [];

    if (
      'menus' in data &&
      typeof data.menus === 'object' &&
      Object.keys(data.menus).length
    ) {
      for (const key of Object.keys(data.menus)) {
        switch (key) {
          case 'monday':
            parsedCreateMenuParamas.push(
              this.parseCreateMenuParamsForDay(data.menus[key], firstDate),
            );
            break;
          case 'tuesday':
            parsedCreateMenuParamas.push(
              this.parseCreateMenuParamsForDay(
                data.menus[key],
                addDays(firstDate, 1),
              ),
            );
            break;
          case 'wednesday':
            parsedCreateMenuParamas.push(
              this.parseCreateMenuParamsForDay(
                data.menus[key],
                addDays(firstDate, 2),
              ),
            );
            break;
          case 'thursday':
            parsedCreateMenuParamas.push(
              this.parseCreateMenuParamsForDay(
                data.menus[key],
                addDays(firstDate, 3),
              ),
            );
            break;
          case 'friday':
            parsedCreateMenuParamas.push(
              this.parseCreateMenuParamsForDay(
                data.menus[key],
                addDays(firstDate, 4),
              ),
            );
            break;
          case 'saturday':
            parsedCreateMenuParamas.push(
              this.parseCreateMenuParamsForDay(
                data.menus[key],
                addDays(firstDate, 5),
              ),
            );
            break;
          case 'sunday':
            parsedCreateMenuParamas.push(
              this.parseCreateMenuParamsForDay(
                data.menus[key],
                addDays(firstDate, 6),
              ),
            );
            break;
          default:
        }
      }
    }

    return parsedCreateMenuParamas;
  }

  private parseCreateMenuParamsForDay(
    data: MenuRow[],
    date: Date,
  ): CreateMenuParams {
    return {
      restaurant_id: this.importDetails.restaurant_id,
      language: this.importDetails.language,
      date,
      menu_items: this.parseMenuItems(data),
    };
  }

  private parseMenuItems(data: MenuRow[]): CreateMenuItemParams[] {
    const menuItems: CreateMenuItemParams[] = [];

    if (Array.isArray(data) && data.length) {
      for (const [weight, menuRow] of data.entries()) {
        const title: string | undefined =
          menuRow[this.titleKey] && typeof menuRow[this.titleKey] === 'string'
            ? menuRow[this.titleKey]
            : undefined;
        const desc: string | undefined =
          menuRow[this.descKey] && typeof menuRow[this.descKey] === 'string'
            ? menuRow[this.descKey]
            : undefined;

        if ((title && title.length) || (desc && desc.length)) {
          const menuItemComponents: CreateMenuItemComponentParams[] = [];
          let type = MenuItemType.NORMAL_MEAL;

          if (title && title.length) {
            const value = normalizeImportedString(title);

            if (value.length) {
              type = SodexoImporter.getMenuItemTypeFromString(
                title,
              ) as MenuItemType;

              menuItemComponents.push({
                type: MenuItemComponentType.FOOD_ITEM,
                value,
                weight: 1,
              });
            }
          }

          if (desc && desc.length) {
            const value = normalizeImportedString(desc);

            if (value.length) {
              menuItemComponents.push({
                type: MenuItemComponentType.INFORMATION,
                value,
                weight: 2,
              });
            }
          }

          if (
            'price' in menuRow &&
            typeof menuRow.price === 'string' &&
            menuRow.price.length
          ) {
            const value = normalizeImportedString(menuRow.price);

            if (value.length) {
              menuItemComponents.push({
                type: MenuItemComponentType.PRICE_INFORMATION,
                value,
                weight: -1,
              });
            }
          }

          menuItems.push({
            type,
            weight: weight + 1,
            menu_item_components: menuItemComponents,
          });
        }
      }
    }

    return menuItems;
  }
}
