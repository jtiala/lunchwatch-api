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

export default class PitopalveluTimonenImporter extends AbstractPuppeteerImporter {
  public name = 'PitopalveluTimonenImporter';

  protected getUrl(identifier: string): string {
    return `https://pitopalvelutimonen.fi/${identifier}`;
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

      const popupElem = document.querySelector<HTMLElement>(
        '.lounaslistapopup-content',
      );

      if (popupElem) {
        popupElem
          .querySelectorAll<HTMLElement>('.item-wrapper')
          .forEach((itemWrapperElem) => {
            const headingElem = itemWrapperElem.querySelector<HTMLElement>(
              '.item-heading',
            );

            if (headingElem) {
              const heading = String(headingElem.innerText);

              if (heading.length) {
                const items = [];

                for (let i = 0; i < itemWrapperElem.childNodes.length; i++) {
                  if (
                    itemWrapperElem.childNodes[i].nodeType === Node.TEXT_NODE
                  ) {
                    items.push(
                      String(itemWrapperElem.childNodes[i].textContent),
                    );
                  }
                }

                if (items.length) {
                  data[heading] = items;
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
            const type = PitopalveluTimonenImporter.getMenuItemTypeFromString(
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
