import delay from 'delay';
import fetch from 'node-fetch';
import Queue from 'p-queue';
import Promise from 'bluebird';
import { getYear, addYears, addDays, getQuarter, parse } from 'date-fns';
import * as menuService from '../services/menuService';
import * as menuItemService from '../services/menuItemService';
import * as menuItemComponentService from '../services/menuItemComponentService';
import * as importer from '../utils/importer';
import logger from '../utils/logger';

const name = 'unirestaImporter';

/**
 * Build menu URL.
 *
 * @param  {String}  identifier
 * @param  {String}  language
 * @return {String}
 */
const getUrl = (identifier, language) => {
  let languageUrlPart = '';

  if (language !== 'fi') {
    languageUrlPart = `${language}/`;
  }

  return `https://www.uniresta.fi/${languageUrlPart}export/rss-${identifier}.json`;
};

const handleMenuItemComponents = (menuItem, components) =>
  new Promise((resolve) => {
    if (Array.isArray(components) && components.length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];

      components.forEach((component) => {
        operations.push(() => delay(500)
          .then(() => menuItemComponentService
            .createMenuItemComponent({
              menuItemId: menuItem.id,
              type: component.type,
              value: component.value,
              weight: component.weight,
            })));
      });

      queue.addAll(operations)
        .then(resolve(menuItem));
    } else {
      resolve(menuItem);
    }
  });

const handleMenuItems = (menu, items) =>
  new Promise((resolve) => {
    if (Object.keys(items).length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];
      let count = 0;
      const meals = {};
      const specialMeals = {};

      Object.keys(items).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(items, key)) {
          if (key.match(/^(ma|ti|ke|to|pe|la|su)-ruokalaji-\d$/)) {
            count += 1;
            meals[count] = {
              type: 'normal_meal',
              components: [
                {
                  type: 'food_item',
                  value: items[key],
                  weight: 1,
                },
              ],
            };
          } else if (key.match(/^(ma|ti|ke|to|pe|la|su)-erikoisuudet-otsikot$/)) {
            if (Array.isArray(items[key]) && items[key].length) {
              items[key].forEach((title, index) => {
                if (typeof specialMeals[index] !== 'object') {
                  specialMeals[index] = {
                    type: 'special_meal',
                    components: [],
                  };
                }

                specialMeals[index].components.push({ type: 'name', value: title, weight: -2 });
              });
            }
          } else if (key.match(/^(ma|ti|ke|to|pe|la|su)-erikoisuudet$/)) {
            if (Array.isArray(items[key]) && items[key].length) {
              items[key].forEach((value, index) => {
                if (typeof specialMeals[index] !== 'object') {
                  specialMeals[index] = {
                    type: 'special_meal',
                    components: [],
                  };
                }

                specialMeals[index].components.push({ type: 'food_item', value, weight: 1 });
              });
            }
          }
        }
      });

      const normalMealCount = Object.keys(meals).length;

      Object.keys(specialMeals).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(specialMeals, key)) {
          meals[normalMealCount + key] = specialMeals[key];
        }
      });

      Object.keys(meals).forEach((key) => {
        if (Object.prototype.hasOwnProperty.call(meals, key)) {
          operations.push(() => delay(500)
            .then(() => menuItemService
              .createMenuItem({
                menuId: menu.id,
                type: meals[key].type,
                weight: key,
              }))
            .then(menuItem => handleMenuItemComponents(menuItem, meals[key].components))
            .catch((err) => {
              logger.log('error', err);
            }));
        }
      });

      queue.addAll(operations)
        .then(resolve(menu));
    } else {
      resolve(menu);
    }
  });

const handleSection = (sectionData, restaurantId, date, language) =>
  new Promise((resolve) => {
    const queue = new Queue({
      concurrency: 1,
      autoStart: true,
    });

    const operations = [];

    const days = {
      monday: {
        date,
        items: {},
      },
      tuesday: {
        date: addDays(date, 1),
        items: {},
      },
      wednesday: {
        date: addDays(date, 2),
        items: {},
      },
      thursday: {
        date: addDays(date, 3),
        items: {},
      },
      friday: {
        date: addDays(date, 4),
        items: {},
      },
      saturday: {
        date: addDays(date, 5),
        items: {},
      },
      sunday: {
        date: addDays(date, 6),
        items: {},
      },
    };

    Object.keys(sectionData).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(sectionData, key)) {
        switch (key.substring(0, 3)) {
          case 'ma-': days.monday.items[key] = sectionData[key];
            break;
          case 'ti-': days.tuesday.items[key] = sectionData[key];
            break;
          case 'ke-': days.wednesday.items[key] = sectionData[key];
            break;
          case 'to-': days.thursday.items[key] = sectionData[key];
            break;
          case 'pe-': days.friday.items[key] = sectionData[key];
            break;
          case 'la-': days.saturday.items[key] = sectionData[key];
            break;
          case 'su-': days.sunday.items[key] = sectionData[key];
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
          .then(menu => handleMenuItems(menu, days[key].items))
          .catch((err) => {
            logger.log('error', err);
          }));
      }
    });

    queue.addAll(operations)
      .then(resolve(sectionData));
  });

const handleJson = (data, restaurantId, language) =>
  new Promise((resolve) => {
    if ('sections' in data && (typeof data.sections === 'object') && Object.keys(data.sections).length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];

      Object.keys(data.sections).forEach((key) => {
        if (
          parseInt(key, 10) > 0 &&
          Object.prototype.hasOwnProperty.call(data.sections, key) &&
          Array.isArray(data.sections[key]) && data.sections[key].length
        ) {
          data.sections[key].forEach((sectionData) => {
            if ('viikko' in sectionData && parseInt(sectionData.viikko, 10) > 0) {
              let year;

              if (['01', '02', '03', '04'].includes(sectionData.viikko) && getQuarter(Date()) === 4) {
                year = getYear(addYears(Date(), 1));
              } else {
                year = getYear(Date());
              }

              const date = parse(`${year}-W${sectionData.viikko}-1`);

              operations.push(() => delay(500)
                .then(() =>
                  handleSection(sectionData, restaurantId, date, language))
                .catch((err) => {
                  logger.log('error', err);
                }));
            }
          });
        }
      });

      queue.addAll(operations)
        .then(resolve(data));
    } else {
      resolve(data);
    }
  });

/**
 * Importer for Uniresta menus.
 * Uniresta menus are fetched from RSS feed
 * that have all the menus available at the moment.
 * Menus for current and next week are usually available.
 *
 * @param {String}  identifier
 * @param {Number}  restaurantId
 * @param {String}  language
 */
const unirestaImporter = (identifier, restaurantId, language) =>
  new Promise((resolve) => {
    const queue = new Queue({
      concurrency: 1,
      autoStart: true,
    });

    const operations = [];
    const startDate = Date();

    operations.push(() => importer.start(name, identifier, language));

    operations.push(() => delay(1000)
      .then(() => fetch(getUrl(identifier, language)))
      .then(res => res.json())
      .then(data => handleJson(data, restaurantId, language))
      .catch((err) => {
        logger.log('error', err);
      }));

    operations.push(() => importer.end(startDate, name, identifier, language));

    queue.addAll(operations)
      .then(resolve());
  });

export default unirestaImporter;

