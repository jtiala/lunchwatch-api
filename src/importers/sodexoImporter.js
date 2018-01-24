import delay from 'delay';
import fetch from 'node-fetch';
import Queue from 'p-queue';
import Promise from 'bluebird';
import { startOfWeek, addWeeks, addDays, format } from 'date-fns';
import * as menuService from '../services/menuService';
import * as menuItemService from '../services/menuItemService';
import * as menuItemComponentService from '../services/menuItemComponentService';
import * as importer from '../utils/importer';
import logger from '../utils/logger';

const name = 'sodexoImporter';

/**
 * Build menu URL.
 *
 * @param  {String}  identifier
 * @param  {String}  language
 * @param  {String}  date        format: 2018/12/31
 * @return {String}
 */
const getUrl = (identifier, language, date) => `https://www.sodexo.fi/ruokalistat/output/weekly_json/${identifier}/${date}/${language}`;

const titleKey = language => `title_${language}`;
const descKey = language => `desc_${language}`;

const handleMenuItemInformation = (menuItem, item, language) =>
  new Promise((resolve) => {
    if (descKey(language) in item
      && (typeof item[descKey(language)] === 'string')
      && item[descKey(language)].length) {
      menuItemComponentService
        .createMenuItemComponent({
          menuItemId: menuItem.id,
          type: 'information',
          value: importer.normalizeString(item[descKey(language)]),
          weight: 2,
        })
        .then(() => resolve(menuItem))
        .catch((err) => {
          logger.log('error', err);
          resolve(menuItem);
        });
    } else {
      resolve(menuItem);
    }
  });

const handleMenuItemFoodItem = (menuItem, item, language) =>
  new Promise((resolve) => {
    if (titleKey(language) in item
      && (typeof item[titleKey(language)] === 'string')
      && item[titleKey(language)].length) {
      menuItemComponentService
        .createMenuItemComponent({
          menuItemId: menuItem.id,
          type: 'food_item',
          value: importer.normalizeString(item[titleKey(language)]),
          weight: 1,
        })
        .then(() => resolve(menuItem))
        .catch((err) => {
          logger.log('error', err);
          resolve(menuItem);
        });
    } else {
      resolve(menuItem);
    }
  });

const handleMenuItemPrice = (menuItem, item) =>
  new Promise((resolve) => {
    if ('price' in item && (typeof price === 'string') && item.price.length) {
      menuItemComponentService
        .createMenuItemComponent({
          menuItemId: menuItem.id,
          type: 'price_information',
          value: importer.normalizeString(item.price),
          weight: -1,
        })
        .then(() => resolve(menuItem))
        .catch((err) => {
          logger.log('error', err);
          resolve(menuItem);
        });
    } else {
      resolve(menuItem);
    }
  });

const handleMenuItems = (menu, items, language) =>
  new Promise((resolve) => {
    if (Object.keys(items).length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];
      let count = 0;

      if (Array.isArray(items) && items.length) {
        items.forEach((item) => {
          if ((titleKey(language) in item
            && (typeof item[titleKey(language)] === 'string')
            && item[titleKey(language)].length)
            || (descKey(language) in item
            && (typeof item[descKey(language)] === 'string')
            && item[descKey(language)].length)
          ) {
            count += 1;
            const weight = count;

            operations.push(() => delay(500)
              .then(() => menuItemService
                .createMenuItem({
                  menuId: menu.id,
                  type: (titleKey(language) in item
                    && (typeof item[titleKey(language)] === 'string')
                    && item[titleKey(language)].length)
                    ? importer.getMenuItemTypeFromString(item[titleKey(language)])
                    : importer.getMenuItemTypeFromString(item[descKey(language)]),
                  weight,
                }))
              .then(menuItem => handleMenuItemPrice(menuItem, item))
              .then(menuItem => handleMenuItemFoodItem(menuItem, item, language))
              .then(menuItem => handleMenuItemInformation(menuItem, item, language))
              .catch(err => logger.log('error', err)));
          }
        });
      }

      queue.addAll(operations)
        .then(resolve(menu));
    } else {
      resolve(menu);
    }
  });

const handleJson = (data, restaurantId, date, language) =>
  new Promise((resolve) => {
    if ('menus' in data && (typeof data.menus === 'object') && Object.keys(data.menus).length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];

      const days = {
        monday: {
          date,
          items: [],
        },
        tuesday: {
          date: addDays(date, 1),
          items: [],
        },
        wednesday: {
          date: addDays(date, 2),
          items: [],
        },
        thursday: {
          date: addDays(date, 3),
          items: [],
        },
        friday: {
          date: addDays(date, 4),
          items: [],
        },
        saturday: {
          date: addDays(date, 5),
          items: [],
        },
        sunday: {
          date: addDays(date, 6),
          items: [],
        },
      };

      Object.keys(data.menus).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(data.menus, key)) {
          switch (key) {
            case 'monday': days.monday.items = data.menus[key];
              break;
            case 'tuesday': days.tuesday.items = data.menus[key];
              break;
            case 'wednesday': days.wednesday.items = data.menus[key];
              break;
            case 'thursday': days.thursday.items = data.menus[key];
              break;
            case 'friday': days.friday.items = data.menus[key];
              break;
            case 'saturday': days.saturday.items = data.menus[key];
              break;
            case 'sunday': days.sunday.items = data.menus[key];
              break;
            default:
          }
        }
      });

      Object.keys(days).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(days, key)) {
          operations.push(() => delay(500)
            .then(() => menuService.deleteMenusForRestaurantForDate(
              restaurantId,
              days[key].date,
              language,
            ))
            .then(() => menuService.createMenu({
              restaurantId,
              date: days[key].date,
              language,
            }))
            .then(menu => handleMenuItems(menu, days[key].items, language))
            .catch(err => logger.log('error', err)));
        }
      });

      queue.addAll(operations)
        .then(resolve(data));
    } else {
      resolve(data);
    }
  });

/**
 * Importer for Sodexo menus.
 * Sodexo menus are fetched per week using the date of monday.
 * Menus for current and next week are usually available.
 *
 * @param {String}  identifier
 * @param {Number}  restaurantId
 * @param {String}  language
 */
const sodexoImporter = (identifier, restaurantId, language) =>
  new Promise((resolve) => {
    const queue = new Queue({
      concurrency: 1,
      autoStart: true,
    });

    const operations = [];
    const thisMonday = startOfWeek(Date(), { weekStartsOn: 1 });
    const nextMonday = addWeeks(thisMonday, 1);
    const startDate = Date();

    operations.push(() => importer.start(name, identifier, language));

    [thisMonday, nextMonday].forEach((date) => {
      operations.push(() => delay(1000)
        .then(() => fetch(getUrl(identifier, language, format(date, 'YYYY/MM/DD'))))
        .then(res => res.json())
        .then(json => handleJson(json, restaurantId, date, language))
        .catch(err => logger.log('error', err)));
    });

    operations.push(() => importer.end(startDate, name, identifier, language));

    queue.addAll(operations)
      .then(resolve());
  });

export default sodexoImporter;
