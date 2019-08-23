import fetch, { Response } from 'node-fetch';
import {
  getYear,
  addYears,
  addDays,
  getQuarter,
  parseISO,
  eachDayOfInterval,
} from 'date-fns';

import AbstractImporter from './AbstractImporter';
import { CreateMenuParams } from '../menu/interfaces';
import { deleteMenusForRestaurantForDate, createMenu } from '../menu/services';
import { CreateMenuItemParams, MenuItemType } from '../menuItem/interfaces';
import {
  CreateMenuItemComponentParams,
  MenuItemComponentType,
} from '../menuItemComponent/interfaces';
import { normalizeImportedString } from '../utils/normalize';

interface Section {
  viikko?: string;
  [key: string]: string | undefined;
}

interface Sections {
  [key: string]: Section[];
}

interface Data {
  sections?: Sections;
}

interface ParsedDay {
  menu: CreateMenuParams;
  menuItems: CreateMenuItemParams[];
  specialMenuItems: CreateMenuItemParams[];
}

export default class UnirestaImporter extends AbstractImporter {
  public name = 'UnirestaImporter';

  protected getUrl(identifier: string, language: string): string {
    const languageUrlPart = language !== 'fi' ? `${language}/` : '';

    return `https://www.uniresta.fi/${languageUrlPart}export/rss-${identifier}.json`;
  }

  public async run(): Promise<void> {
    await fetch(
      this.getUrl(this.importDetails.identifier, this.importDetails.language),
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

  private async handleData(data: Data): Promise<void> {
    if (
      'sections' in data &&
      typeof data.sections === 'object' &&
      Object.keys(data.sections).length
    ) {
      for (const key of Object.keys(data.sections)) {
        if (
          parseInt(key, 10) > 0 &&
          Object.prototype.hasOwnProperty.call(data.sections, key) &&
          Array.isArray(data.sections[key]) &&
          data.sections[key].length
        ) {
          for (const sectionData of data.sections[key]) {
            if (
              'viikko' in sectionData &&
              sectionData.viikko &&
              parseInt(sectionData.viikko, 10) > 0
            ) {
              const year =
                ['01', '02', '03', '04'].includes(sectionData.viikko) &&
                getQuarter(new Date()) === 4
                  ? getYear(addYears(new Date(), 1))
                  : getYear(new Date());

              const firstDate = parseISO(`${year}-W${sectionData.viikko}-1`);

              await this.handleSection(sectionData, firstDate);
            }
          }
        }
      }
    }
  }

  private async handleSection(data: Section, firstDate: Date): Promise<void> {
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
    data: Section,
    firstDate: Date,
  ): CreateMenuParams[] {
    const parsedDays = eachDayOfInterval({
      start: firstDate,
      end: addDays(firstDate, 6),
    }).map(
      (date: Date): ParsedDay => ({
        menu: {
          restaurant_id: this.importDetails.restaurant_id,
          language: this.importDetails.language,
          date,
        },
        menuItems: [],
        specialMenuItems: [],
      }),
    );

    for (const key of Object.keys(data)) {
      const dataRow =
        (Object.prototype.hasOwnProperty.call(data, key) &&
          typeof data[key] === 'string') ||
        Array.isArray(data[key])
          ? data[key]
          : undefined;

      if (dataRow) {
        switch (key.substring(0, 3)) {
          case 'ma-':
            parsedDays[0] = this.parseDay(parsedDays[0], key, dataRow);
            break;
          case 'ti-':
            parsedDays[1] = this.parseDay(parsedDays[1], key, dataRow);
            break;
          case 'ke-':
            parsedDays[2] = this.parseDay(parsedDays[2], key, dataRow);
            break;
          case 'to-':
            parsedDays[3] = this.parseDay(parsedDays[3], key, dataRow);
            break;
          case 'pe-':
            parsedDays[4] = this.parseDay(parsedDays[4], key, dataRow);
            break;
          case 'la-':
            parsedDays[5] = this.parseDay(parsedDays[5], key, dataRow);
            break;
          case 'su-':
            parsedDays[6] = this.parseDay(parsedDays[6], key, dataRow);
            break;
          default:
        }
      }
    }

    return parsedDays.map(
      (parsedDay): CreateMenuParams => ({
        ...parsedDay.menu,
        menu_items: [
          ...(parsedDay.menuItems ? parsedDay.menuItems : []),
          ...(parsedDay.specialMenuItems ? parsedDay.specialMenuItems : []),
        ],
      }),
    );
  }

  private parseDay(
    previousParsedDay: ParsedDay,
    key: string,
    data: string | string[],
  ): ParsedDay {
    if (
      key.match(/^(ma|ti|ke|to|pe|la|su)-ruokalaji-\d$/) &&
      typeof data === 'string'
    ) {
      const value = normalizeImportedString(data);

      if (value.length) {
        const type = UnirestaImporter.getMenuItemTypeFromString(
          value,
        ) as MenuItemType;
        const menuItemComponents: CreateMenuItemComponentParams[] = [
          {
            type:
              type === MenuItemType.LUNCH_TIME
                ? MenuItemComponentType.LUNCH_TIME
                : MenuItemComponentType.FOOD_ITEM,
            value,
            weight: 1,
          },
        ];

        return {
          ...previousParsedDay,
          menuItems: [
            ...previousParsedDay.menuItems,
            {
              type,
              menu_item_components: menuItemComponents,
              weight:
                type === MenuItemType.LUNCH_TIME
                  ? -1
                  : previousParsedDay.menuItems.length + 1,
            },
          ],
        };
      }
    } else if (
      key.match(/^(ma|ti|ke|to|pe|la|su)-erikoisuudet-otsikot$/) &&
      Array.isArray(data) &&
      data.length
    ) {
      const newParsedDay = { ...previousParsedDay };

      for (const [index, item] of data.entries()) {
        const value = normalizeImportedString(item);

        if (value.length) {
          const type = UnirestaImporter.getMenuItemTypeFromString(
            value,
            MenuItemType.SPECIAL_MEAL,
            [MenuItemType.LUNCH_TIME],
          ) as MenuItemType;
          const menuItemComponents: CreateMenuItemComponentParams[] = [];

          menuItemComponents.push({
            type: MenuItemComponentType.NAME,
            value,
            weight: -2,
          });

          if (typeof newParsedDay.specialMenuItems[index] !== 'object') {
            newParsedDay.specialMenuItems[index] = {
              type,
              menu_item_components: menuItemComponents,
              weight: index + 100,
            };
          } else {
            const oldMenuItemComponents =
              newParsedDay.specialMenuItems[index].menu_item_components;

            newParsedDay.specialMenuItems[index].type = type;
            newParsedDay.specialMenuItems[index].menu_item_components = [
              ...(Array.isArray(oldMenuItemComponents)
                ? oldMenuItemComponents
                : []),
              ...menuItemComponents,
            ];
          }
        }
      }

      return newParsedDay;
    } else if (
      key.match(/^(ma|ti|ke|to|pe|la|su)-erikoisuudet$/) &&
      Array.isArray(data) &&
      data.length
    ) {
      const newParsedDay = { ...previousParsedDay };

      for (const [index, item] of data.entries()) {
        const value = normalizeImportedString(item);

        if (value.length) {
          const type = MenuItemType.SPECIAL_MEAL;
          const menuItemComponents: CreateMenuItemComponentParams[] = [];

          menuItemComponents.push({
            type: MenuItemComponentType.FOOD_ITEM,
            value,
            weight: 1,
          });

          if (typeof newParsedDay.specialMenuItems[index] !== 'object') {
            newParsedDay.specialMenuItems[index] = {
              type,
              menu_item_components: menuItemComponents,
              weight: index + 100,
            };
          } else {
            const oldMenuItemComponents =
              newParsedDay.specialMenuItems[index].menu_item_components;

            newParsedDay.specialMenuItems[index].menu_item_components = [
              ...(Array.isArray(oldMenuItemComponents)
                ? oldMenuItemComponents
                : []),
              ...menuItemComponents,
            ];
          }
        }
      }

      return newParsedDay;
    }

    return previousParsedDay;
  }
}
