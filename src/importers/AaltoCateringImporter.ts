import { isToday, isFuture, startOfWeek, addDays } from 'date-fns';

import AbstractPuppeteerImporter from './AbstractPuppeteerImporter';
import { CreateMenuParams } from '../menu/interfaces';
import { deleteMenusForRestaurantForDate, createMenu } from '../menu/services';
import { CreateMenuItemParams, MenuItemType } from '../menuItem/interfaces';
import { MenuItemComponentType } from '../menuItemComponent/interfaces';
import { normalizeImportedString } from '../utils/normalize';

interface ParsedData {
  [index: string]: string[];
}

export default class AaltoCateringImporter extends AbstractPuppeteerImporter {
  public name = 'AaltoCateringImporter';

  protected getUrl(identifier: string): string {
    return `https://www.aaltocatering.fi/${identifier}`;
  }

  public async run(): Promise<void> {
    const parsedData = await this.getData();
    const parsedCreateMenuParamas = this.parseCreateMenuParams(parsedData);

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

  private async getData(): Promise<ParsedData> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    await page.goto(this.getUrl(this.importDetails.identifier));

    const parsedData = await page.evaluate(() => {
      const data: ParsedData = {};

      // There are two .panel-grid-cell elements inside .menulistat.
      // Everyrthing we need is inside the first one.
      // There's only one .so-panel inside the cell.
      const panelElem = document.querySelector(
        'div.menulistat > .panel-grid-cell > .so-panel',
      );

      if (panelElem) {
        // Lunch time doesn't have any class that would help us to recognize it
        // Hopefully the first h4 in .lunch-block__description won't ever contain anything else
        const lunchTimeElem = panelElem.querySelector(':scope > .widget-title');

        if (lunchTimeElem && lunchTimeElem.textContent) {
          data['lunchTime'] = [lunchTimeElem.textContent.trim()];
        }

        // At the moment, all the food stuff is inside one .textwidget
        // Lets use querySelectorAll if some day there's more than one
        panelElem.querySelectorAll('div.textwidget').forEach((menuItemElem) => {
          // Since all the data is inside one dive, let's assume a new item
          // starts with h4, possibly followed by one or more <p> (without class)
          // containing menu items
          // If there's a p before the first h4, it's price info
          const menuItemChildren = menuItemElem.querySelectorAll(':scope > *');
          let previousDay: string;
          let skipRest = false;

          menuItemChildren.forEach((menuItemChild) => {
            const isDay = menuItemChild.tagName === 'H4';

            const content =
              menuItemChild.textContent && menuItemChild.textContent.trim();

            // On some menus, english menu is on the same page after ***
            // For now, lets skip everything after ***
            if (content === '***') {
              skipRest = true;
            }

            if (content && !skipRest) {
              if (isDay) {
                // If current piece of data is day, the following data will be associated to this day
                previousDay = content;
              }
              // if no day is found yet, the data is considered as price information
              else if (!previousDay) {
                data['priceInformation'] = [
                  ...(Array.isArray(data['priceInformation'])
                    ? data['priceInformation']
                    : []),
                  content,
                ];
              } else {
                data[previousDay] = [
                  ...(Array.isArray(data[previousDay])
                    ? data[previousDay]
                    : []),
                  ...content.split('\n'),
                ];
              }
            }
          });
        });
      }

      return data;
    });

    await page.close();
    await browser.close();

    return parsedData;
  }

  private parseCreateMenuParams(data: ParsedData): CreateMenuParams[] {
    const createMenuParams: CreateMenuParams[] = [];
    const commonMenuItemParams: CreateMenuItemParams[] = [];

    for (const [key, items] of Object.entries(data)) {
      if (key === 'lunchTime') {
        if (Array.isArray(items)) {
          if (typeof items[0] === 'string') {
            const value = normalizeImportedString(items[0]);

            if (value) {
              commonMenuItemParams.push({
                type: MenuItemType.LUNCH_TIME,
                weight: -2,
                menu_item_components: [
                  {
                    type: MenuItemComponentType.LUNCH_TIME,
                    value,
                  },
                ],
              });
            }
          }
        }

        continue;
      }

      if (key === 'priceInformation') {
        if (Array.isArray(items)) {
          for (const priceInformationItem of items) {
            if (typeof priceInformationItem === 'string') {
              const value = normalizeImportedString(priceInformationItem);

              if (value) {
                commonMenuItemParams.push({
                  type: MenuItemType.PRICE_INFORMATION,
                  weight: -1,
                  menu_item_components: [
                    {
                      type: MenuItemComponentType.PRICE_INFORMATION,
                      value,
                    },
                  ],
                });
              }
            }
          }
        }

        continue;
      }

      const date = this.getDayFromString(key);

      if (date) {
        const createMenuItemParams: CreateMenuItemParams[] = [];

        for (const item of items) {
          if (typeof item === 'string') {
            const value = normalizeImportedString(item);
            const type = AaltoCateringImporter.getMenuItemTypeFromString(
              value,
            ) as MenuItemType;

            if (value) {
              createMenuItemParams.push({
                type,
                weight: createMenuItemParams.length,
                menu_item_components: [
                  {
                    type: MenuItemComponentType.FOOD_ITEM,
                    value,
                  },
                ],
              });
            }
          }
        }

        if (createMenuItemParams.length) {
          createMenuParams.push({
            restaurant_id: this.importDetails.restaurant_id,
            language: this.importDetails.language,
            date,
            menu_items: [...commonMenuItemParams, ...createMenuItemParams],
          });
        }
      }
    }

    return createMenuParams;
  }

  private getDayFromString(string: string): Date | void {
    const thisMonday = startOfWeek(new Date(), {
      weekStartsOn: 1,
    });

    switch (string.trim().toLowerCase()) {
      case 'maanantai':
        return thisMonday;
      case 'tiistai':
        return addDays(thisMonday, 1);
      case 'keskiviikko':
        return addDays(thisMonday, 2);
      case 'torstai':
        return addDays(thisMonday, 3);
      case 'perjantai':
        return addDays(thisMonday, 4);
      case 'lauantai':
        return addDays(thisMonday, 5);
      case 'sunnuntai':
        return addDays(thisMonday, 6);
    }
  }
}
