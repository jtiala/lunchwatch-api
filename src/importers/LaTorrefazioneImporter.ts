import {
  isToday,
  isFuture,
  startOfWeek,
  addDays,
  eachDayOfInterval,
} from 'date-fns';

import AbstractPuppeteerImporter from './AbstractPuppeteerImporter';
import { CreateMenuParams } from '../menu/interfaces';
import { deleteMenusForRestaurantForDate, createMenu } from '../menu/services';
import { CreateMenuItemParams, MenuItemType } from '../menuItem/interfaces';
import {
  CreateMenuItemComponentParams,
  MenuItemComponentType,
} from '../menuItemComponent/interfaces';
import { normalizeImportedString } from '../utils/normalize';

interface ParsedData {
  type?: string | undefined | null;
  title?: string | undefined | null;
  value?: string | undefined | null;
  price?: string | undefined | null;
}

export default class LaTorrefazioneImporter extends AbstractPuppeteerImporter {
  public name = 'LaTorrefazioneImporter';

  protected getUrl(identifier: string, language: string): string {
    if (language === 'en') {
      return `http://www.latorre.fi/en/location/${identifier}`;
    }

    return `http://www.latorre.fi/toimipiste/${identifier}`;
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

  private async getData(): Promise<ParsedData[]> {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    await page.goto(
      this.getUrl(this.importDetails.identifier, this.importDetails.language),
    );

    const parsedData = await page.evaluate(() => {
      const data: ParsedData[] = [];

      // There is two elements with id lounas, we use the one that's inside div.content
      const lunchElem = document.querySelector<HTMLElement>(
        'div.content div#lounas',
      );

      if (lunchElem) {
        // Lunch time doesn't have any class that would help us to recognize it
        // Hopefully the first h4 in .lunch-block__description won't ever contain anything else
        const lunchTimeElem = lunchElem.querySelector<HTMLElement>(
          '.lunch-block__description > h4',
        );

        if (lunchTimeElem && lunchTimeElem.innerText) {
          data.push({
            type: 'lunchTime',
            value: lunchTimeElem.innerText.trim(),
          });
        }

        // At the moment, all the food stuff is inside one .menu-item
        // Lets use querySelectorAll if some day there's more than one
        lunchElem
          .querySelectorAll<HTMLElement>('div.menu-item')
          .forEach((menuItemElem) => {
            // Since all the menu-items are inside one dive, let's assume a new item
            // starts with .menu-item__title, possibly followed by a <p> (without class)
            // containing the value, possibly followed by .menu-item__price
            const menuItemChildren = menuItemElem.querySelectorAll<HTMLElement>(
              ':scope > *',
            );
            let wipData: ParsedData = {};

            menuItemChildren.forEach((menuItemChild) => {
              const type = menuItemChild.classList.contains('menu-item__title')
                ? 'title'
                : menuItemChild.classList.contains('menu-item__price')
                ? 'price'
                : menuItemChild.tagName === 'P'
                ? 'value'
                : undefined;
              const content =
                menuItemChild.innerText && menuItemChild.innerText.trim();

              // If current piece of data is title, last wipData is ready to be pushed
              if (type === 'title') {
                if (Object.keys(wipData).length) {
                  data.push(wipData);
                }

                wipData = {};
              }

              if (content && type && !(type in wipData)) {
                wipData[type] = content;
              }
            });

            // After the loop, push last wipData if it contains anything
            if (Object.keys(wipData).length) {
              data.push(wipData);
            }
          });
      }

      return data;
    });

    await page.close();
    await browser.close();

    if (Array.isArray(parsedData)) {
      return parsedData;
    }

    return [];
  }

  private parseCreateMenuParams(data: ParsedData[]): CreateMenuParams[] {
    const createMenuItemParams: CreateMenuItemParams[] = [];

    for (const [weight, item] of data.entries()) {
      if (item.type === 'lunchTime' && item.value) {
        const value = normalizeImportedString(item.value);

        if (value) {
          createMenuItemParams.push({
            type: MenuItemType.LUNCH_TIME,
            weight,
            menu_item_components: [
              {
                type: MenuItemComponentType.LUNCH_TIME,
                value,
              },
            ],
          });
        }
      } else if (item.title) {
        const title = normalizeImportedString(item.title);
        const value = item.value && normalizeImportedString(item.value);
        const price = item.price && normalizeImportedString(item.price);
        const type = LaTorrefazioneImporter.getMenuItemTypeFromString(
          title,
        ) as MenuItemType;

        const components: CreateMenuItemComponentParams[] = [
          {
            type: MenuItemComponentType.NAME,
            value: title,
            weight: -2,
          },
        ];

        if (price && price.length) {
          components.push({
            type: MenuItemComponentType.PRICE_INFORMATION,
            value: price,
            weight: -1,
          });
        }

        if (value && value.length) {
          components.push({
            type: MenuItemComponentType.FOOD_ITEM,
            value,
            weight: 1,
          });
        }

        createMenuItemParams.push({
          type,
          weight,
          menu_item_components: components,
        });
      }
    }

    const thisMonday = startOfWeek(new Date(), {
      weekStartsOn: 1,
    });
    const thisFriday = addDays(thisMonday, 5);

    const parsedCreateMenuParams: CreateMenuParams[] = eachDayOfInterval({
      start: thisMonday,
      end: thisFriday,
    }).map(
      (date: Date): CreateMenuParams => ({
        restaurant_id: this.importDetails.restaurant_id,
        language: this.importDetails.language,
        date,
        menu_items: createMenuItemParams,
      }),
    );

    return parsedCreateMenuParams;
  }
}
