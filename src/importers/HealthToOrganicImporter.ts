import fetch, { Response } from 'node-fetch';
import {
  isToday,
  isFuture,
  getYear,
  addYears,
  addDays,
  getQuarter,
  parseISO,
  eachDayOfInterval,
  startOfWeek,
} from 'date-fns';
import he from 'he';
import striptags from 'striptags';

import AbstractImporter from './AbstractImporter';
import { CreateMenuParams } from '../menu/interfaces';
import { deleteMenusForRestaurantForDate, createMenu } from '../menu/services';
import { CreateMenuItemParams, MenuItemType } from '../menuItem/interfaces';
import {
  CreateMenuItemComponentParams,
  MenuItemComponentType,
} from '../menuItemComponent/interfaces';
import { normalizeImportedString } from '../utils/normalize';
import { empty } from 'apollo-link';

interface Section {
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
}

export default class HealthToOrganicImporter extends AbstractImporter {
  public name = 'HealthToOrganicImporter';

  protected getUrl(identifier: string): string {
    return `https://www.health2organic.fi/lounaslistat/${identifier}.json`;
  }

  public async run(): Promise<void> {
    await fetch(this.getUrl(this.importDetails.identifier))
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
            await this.handleSection(sectionData);
          }
        }
      }
    }
  }

  private async handleSection(data: Section): Promise<void> {
    const parsedCreateMenuParamas = this.parseCreateMenuParams(data);

    for (const createMenuParams of parsedCreateMenuParamas) {
      if (isToday(createMenuParams.date) || isFuture(createMenuParams.date)) {
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
  }

  private parseCreateMenuParams(data: Section): CreateMenuParams[] {
    const parsedCreateMenuParamas: CreateMenuParams[] = [];

    const thisMonday = startOfWeek(new Date(), {
      weekStartsOn: 1,
    });

    for (const key of Object.keys(data)) {
      const dataRow =
        Object.prototype.hasOwnProperty.call(data, key) &&
        typeof data[key] === 'string'
          ? data[key]
          : undefined;

      if (dataRow) {
        const date = this.getDate(thisMonday, key);

        if (date) {
          const parsedDay: CreateMenuParams | undefined = this.parseDay(
            dataRow,
            date,
          );

          if (
            parsedDay &&
            'menu_items' in parsedDay &&
            Array.isArray(parsedDay.menu_items) &&
            parsedDay.menu_items.length
          ) {
            parsedCreateMenuParamas.push(parsedDay);
          }
        }
      }
    }

    return parsedCreateMenuParamas;
  }

  private getDate(monday: Date, dateName: string): Date | undefined {
    switch (dateName) {
      case 'maanantai':
        return monday;
      case 'tiistai':
        return addDays(monday, 1);
      case 'keskiviikko':
        return addDays(monday, 2);
      case 'torstai':
        return addDays(monday, 3);
      case 'perjantai':
        return addDays(monday, 4);
      case 'lauantai':
        return addDays(monday, 5);
      case 'sunnuntai':
        return addDays(monday, 6);
    }
  }

  /* Please don't look at this */
  /* H2O data seems to be entered by a human in a single wysiwyg field and it's a nightmare to parse */
  private parseDay(data: string, date: Date): CreateMenuParams | undefined {
    if (typeof data === 'string' && data.length) {
      const components = he.decode(striptags(data)).split('\r\n');

      const createMenuItemParams: CreateMenuItemParams[] = [];

      let wipItem: CreateMenuItemParams = {
        type: MenuItemType.NORMAL_MEAL,
        menu_item_components: [],
        weight: 0,
      };

      // Start a new item after there has been 2 itemChange conditions
      // Conditions: empty row, row containing €
      let itemChangeConditions = 0;

      for (const component of components) {
        const value = normalizeImportedString(component);

        if (value.length) {
          if (value.toLowerCase().includes('€')) {
            itemChangeConditions = 1;
          } else {
            itemChangeConditions = 0;
          }

          const currentComponents = Array.isArray(wipItem.menu_item_components)
            ? wipItem.menu_item_components
            : [];

          wipItem.menu_item_components = [
            ...currentComponents,
            {
              type: MenuItemComponentType.FOOD_ITEM,
              value,
              weight: currentComponents.length,
            },
          ];
        } else {
          if (itemChangeConditions > 2) {
            if (
              Array.isArray(wipItem.menu_item_components) &&
              wipItem.menu_item_components.length
            ) {
              createMenuItemParams.push(wipItem);
            }

            wipItem = {
              type: MenuItemType.NORMAL_MEAL,
              menu_item_components: [],
              weight: Number(wipItem.weight) + 1,
            };

            itemChangeConditions = 0;
          } else {
            itemChangeConditions++;
          }
        }
      }

      if (
        Array.isArray(wipItem.menu_item_components) &&
        wipItem.menu_item_components.length
      ) {
        createMenuItemParams.push(wipItem);
      }

      if (createMenuItemParams.length) {
        return {
          restaurant_id: this.importDetails.restaurant_id,
          language: this.importDetails.language,
          date,
          menu_items: createMenuItemParams,
        };
      }
    }
  }
}
