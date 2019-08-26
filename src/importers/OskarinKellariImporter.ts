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

export default class OskarinKellariImporter extends AbstractPuppeteerImporter {
  public name = 'OskarinKellariImporter';

  protected getUrl(identifier: string): string {
    return `http://www.oskarinkellari.com/index.php?${identifier}`;
  }

  public async run(): Promise<void> {
    const parsedData = await this.getData();
    const parsedCreateMenuParamas = this.parseCreateMenuParams(parsedData);
    console.log(JSON.stringify(parsedCreateMenuParamas, null, 2));

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

      const rootElem = document.querySelector<HTMLElement>('.wholeweek');

      if (rootElem) {
        let previousHeader: string;

        rootElem
          .querySelectorAll<HTMLElement>(':scope > *')
          .forEach((itemElem) => {
            const isHeader = itemElem.tagName === 'H3';
            const isContent = itemElem.tagName === 'I';

            if (isHeader) {
              // If current piece of data is a header, the following data will be associated to this header
              previousHeader = String(itemElem.innerText).trim();
            } else if (isContent && previousHeader) {
              const menuElems = itemElem.querySelectorAll<HTMLElement>('.menu');

              if (menuElems.length) {
                for (const menuElem of menuElems) {
                  const value = String(menuElem.innerText).trim();

                  if (value.length) {
                    data[previousHeader] = [
                      ...(Array.isArray(data[previousHeader])
                        ? data[previousHeader]
                        : []),
                      value,
                    ];
                  }
                }
              }
            }
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

    for (const [key, items] of Object.entries(data)) {
      const date = this.getDayFromString(key);

      if (date) {
        const createMenuItemParams: CreateMenuItemParams[] = [];

        for (const item of items) {
          if (typeof item === 'string') {
            const value = normalizeImportedString(item);
            const type = OskarinKellariImporter.getMenuItemTypeFromString(
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
            menu_items: createMenuItemParams,
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

    switch (
      string
        .trim()
        .replace(/\:+$/, '')
        .toLowerCase()
    ) {
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
