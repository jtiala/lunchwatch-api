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
  MenuItemComponentType,
  CreateMenuItemComponentParams,
} from '../menuItemComponent/interfaces';
import { normalizeImportedString } from '../utils/normalize';

interface DataRow {
  name?: string;
  price?: string;
  informationItems?: string[];
  foodItems?: string[];
}

interface ParsedData {
  [index: string]: DataRow[];
}

export default class RaflaamoImporter extends AbstractPuppeteerImporter {
  public name = 'RaflaamoImporter';

  protected getUrl(identifier: string, language: string): string {
    return `https://www.raflaamo.fi/${language}/${identifier}`;
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

    await page.goto(
      this.getUrl(this.importDetails.identifier, this.importDetails.language),
    );

    const parsedData = await page.evaluate(() => {
      const data: ParsedData = {};

      const rootElem = document.querySelector<HTMLElement>(
        '#schema-restaurant-menu-detail',
      );

      if (rootElem) {
        let previousHeader: string;

        rootElem
          .querySelectorAll<HTMLElement>(':scope > *')
          .forEach((rowElem) => {
            const isHeader =
              rowElem.tagName === 'H2' &&
              rowElem.classList.contains('menu-detail__header');
            const isDescription = rowElem.classList.contains(
              'menu-detail__menu-description',
            );
            const isDishList = rowElem.classList.contains(
              'menu-detail__dish-list',
            );

            if (isHeader) {
              // If current piece of data is a header, the following data will be associated to this header
              previousHeader = String(rowElem.innerText).trim();
            }
            // if no header is found yet, description data is saved as common information
            else if (!previousHeader && isDescription) {
              const value = String(rowElem.innerText).trim();

              if (value.length) {
                data['common'] = [
                  ...(Array.isArray(data['common']) ? data['common'] : []),
                  { informationItems: [value] },
                ];
              }
            }
            // if there's a header and current row is description, data is saved as daily information
            else if (isDescription) {
              const value = String(rowElem.innerText).trim();

              if (value.length) {
                data[previousHeader] = [
                  ...(Array.isArray(data[previousHeader])
                    ? data[previousHeader]
                    : []),
                  { informationItems: [value] },
                ];
              }
            }
            // if there's a header and current row is dish list, parse menu items
            else if (previousHeader && isDishList) {
              rowElem.querySelectorAll<HTMLElement>('li').forEach((liElem) => {
                const item: DataRow = {};

                liElem
                  .querySelectorAll<HTMLElement>('div')
                  .forEach((liChildElem) => {
                    if (
                      liChildElem.classList.contains('menu-detail__dish-info')
                    ) {
                      const nameElem = liChildElem.querySelector<HTMLElement>(
                        '.menu-detail__dish-name',
                      );

                      const priceElem = liChildElem.querySelector<HTMLElement>(
                        '.menu-detail__dish-price',
                      );

                      if (nameElem) {
                        const value = String(nameElem.innerText).trim();

                        if (value.length) {
                          item.name = value;
                        }
                      }

                      if (priceElem) {
                        const value = String(priceElem.innerText).trim();

                        if (value.length) {
                          item.price = value;
                        }
                      }
                    } else if (
                      liChildElem.classList.contains(
                        'menu-detail__dish-description',
                      )
                    ) {
                      const value = String(liChildElem.innerText).trim();

                      if (value.length) {
                        item.foodItems = [
                          ...(Array.isArray(item.foodItems)
                            ? item.foodItems
                            : []),
                          value,
                        ];
                      }
                    }
                  });

                if (Object.keys(item).length) {
                  data[previousHeader] = [
                    ...(Array.isArray(data[previousHeader])
                      ? data[previousHeader]
                      : []),
                    item,
                  ];
                }
              });
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
    const commonMenuItemParams: CreateMenuItemParams[] = [];

    for (const [key, items] of Object.entries(data)) {
      if (key === 'common') {
        if (Array.isArray(items)) {
          for (const commonItem of items) {
            if (Array.isArray(commonItem.informationItems)) {
              for (const informationItem of commonItem.informationItems) {
                const value = normalizeImportedString(informationItem);

                if (value) {
                  commonMenuItemParams.push({
                    type: MenuItemType.INFORMATION,
                    weight: -3,
                    menu_item_components: [
                      {
                        type: MenuItemComponentType.INFORMATION,
                        value,
                      },
                    ],
                  });
                }
              }
            }
          }
        }

        continue;
      }

      if (key.toLowerCase().includes('koko viikko')) {
        const thisMonday = startOfWeek(new Date(), {
          weekStartsOn: 1,
        });

        eachDayOfInterval({
          start: thisMonday,
          end: addDays(thisMonday, 4),
        }).map((date: Date): void => {
          const dailyMenuParams = this.parseDailyMenuParams(
            date,
            items,
            commonMenuItemParams,
          );

          if (dailyMenuParams) {
            createMenuParams.push(dailyMenuParams);
          }
        });

        continue;
      }

      const date = this.getDayFromString(key);

      if (date) {
        const dailyMenuParams = this.parseDailyMenuParams(
          date,
          items,
          commonMenuItemParams,
        );

        if (dailyMenuParams) {
          createMenuParams.push(dailyMenuParams);
        }
      }
    }

    return createMenuParams;
  }

  private parseDailyMenuParams(
    date: Date,
    items: DataRow[],
    commonMenuItemParams: CreateMenuItemParams[],
  ): CreateMenuParams | void {
    const createMenuItemParams: CreateMenuItemParams[] = [];

    for (const [itemWeight, item] of items.entries()) {
      if (Array.isArray(item.informationItems)) {
        for (const informationItem of item.informationItems) {
          const value = normalizeImportedString(informationItem);

          if (value) {
            createMenuItemParams.push({
              type: MenuItemType.INFORMATION,
              weight: -2,
              menu_item_components: [
                {
                  type: MenuItemComponentType.INFORMATION,
                  value,
                },
              ],
            });
          }
        }

        continue;
      }

      const createMenuItemComponentParams: CreateMenuItemComponentParams[] = [];
      let type = MenuItemType.NORMAL_MEAL;

      if ('name' in item && typeof item.name === 'string') {
        const value = normalizeImportedString(item.name);

        if (value.length) {
          type = RaflaamoImporter.getMenuItemTypeFromString(
            value,
          ) as MenuItemType;

          createMenuItemComponentParams.push({
            type: MenuItemComponentType.NAME,
            value,
            weight: -2,
          });
        }
      }

      if ('price' in item && typeof item.price === 'string') {
        const value = normalizeImportedString(item.price);

        if (value.length) {
          createMenuItemComponentParams.push({
            type: MenuItemComponentType.PRICE_INFORMATION,
            value,
            weight: -1,
          });
        }
      }

      if (
        'foodItems' in item &&
        Array.isArray(item.foodItems) &&
        item.foodItems.length
      ) {
        for (const [weight, foodItem] of item.foodItems.entries()) {
          const value = normalizeImportedString(foodItem);

          if (value.length) {
            createMenuItemComponentParams.push({
              type: MenuItemComponentType.FOOD_ITEM,
              value,
              weight,
            });
          }
        }
      }

      if (createMenuItemComponentParams.length) {
        createMenuItemParams.push({
          type,
          weight: itemWeight,
          menu_item_components: createMenuItemComponentParams,
        });
      }
    }

    if (createMenuItemParams.length) {
      return {
        restaurant_id: this.importDetails.restaurant_id,
        language: this.importDetails.language,
        date,
        menu_items: [...commonMenuItemParams, ...createMenuItemParams],
      };
    }
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
