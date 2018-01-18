import delay from 'delay';
import fetch from 'node-fetch';
import Queue from 'p-queue';
import Promise from 'bluebird';
import startOfWeek from 'date-fns/start_of_week';
import addWeeks from 'date-fns/add_weeks';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import * as menuService from '../services/menuService';
import * as menuItemService from '../services/menuItemService';
import * as menuItemComponentService from '../services/menuItemComponentService';
import * as importer from '../utils/importer';
import logger from '../utils/logger';

const name = 'amicaImporter';

/**
 * Build menu URL.
 *
 * @param  {String}  identifier
 * @param  {String}  language
 * @param  {String}  date
 * @return {String}
 */
const getUrl = (identifier, language, date) => `https://www.amica.fi/modules/json/json/Index?costNumber=${identifier}&language=${language}&firstDay=${date}`;

const handleMenuItemComponent = (menuItem, setMenuComponentJson, count) =>
  new Promise((resolve) => {
    menuItemComponentService
      .createMenuItemComponent({
        menuItemId: menuItem.id,
        type: 'food_item',
        value: setMenuComponentJson,
        weight: count,
      })
      .then(() => resolve(menuItem))
      .catch((err) => {
        logger.log('error', err);
        resolve(menuItem);
      });
  });

const handleMenuItemComponents = (menuItem, setMenuJson) =>
  new Promise((resolve) => {
    if ('Components' in setMenuJson && Array.isArray(setMenuJson.Components) && setMenuJson.Components.length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];
      let count = 0;

      setMenuJson.Components.forEach((setMenuComponentJson) => {
        if ((typeof setMenuComponentJson === 'string') && setMenuComponentJson.length) {
          count += 1;
          operations.push(() => delay(500)
            .then(() => handleMenuItemComponent(menuItem, setMenuComponentJson, count))
            .catch((err) => {
              logger.log('error', err);
            }));
        }
      });

      queue.addAll(operations)
        .then(resolve(menuItem));
    } else {
      resolve(menuItem);
    }
  });

const handleMenuItemPrice = (menuItem, setMenuJson) =>
  new Promise((resolve) => {
    if ('Price' in setMenuJson && (typeof setMenuJson.Price === 'string') && setMenuJson.Price.length) {
      menuItemComponentService
        .createMenuItemComponent({
          menuItemId: menuItem.id,
          type: 'price_information',
          value: setMenuJson.Price,
          weight: -2,
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

const handleMenuItemName = (menuItem, setMenuJson) =>
  new Promise((resolve) => {
    if ('Name' in setMenuJson && (typeof setMenuJson.Name === 'string') && setMenuJson.Name.length) {
      menuItemComponentService
        .createMenuItemComponent({
          menuItemId: menuItem.id,
          type: 'name',
          value: setMenuJson.Name,
          weight: -2,
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

const handleSetMenu = (menu, setMenuJson, count) =>
  new Promise((resolve) => {
    menuItemService
      .createMenuItem({
        menuId: menu.id,
        type: 'normal_meal',
        weight: count,
      })
      .then(menuItem => handleMenuItemName(menuItem, setMenuJson))
      .then(menuItem => handleMenuItemPrice(menuItem, setMenuJson))
      .then(menuItem => handleMenuItemComponents(menuItem, setMenuJson))
      .then(() => resolve(menu))
      .catch((err) => {
        logger.log('error', err);
        resolve(menu);
      });
  });

const handleSetMenus = (menu, menuJson) =>
  new Promise((resolve) => {
    if ('SetMenus' in menuJson && Array.isArray(menuJson.SetMenus) && menuJson.SetMenus.length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];
      let count = 0;

      menuJson.SetMenus.forEach((setMenuJson) => {
        count += 1;
        operations.push(() => delay(500)
          .then(() => handleSetMenu(menu, setMenuJson, count))
          .catch((err) => {
            logger.log('error', err);
          }));
      });

      queue.addAll(operations)
        .then(resolve(menu));
    } else {
      resolve(menu);
    }
  });

const handleMenuLunchTime = (menu, menuJson) =>
  new Promise((resolve) => {
    if ('LunchTime' in menuJson && (typeof menuJson.LunchTime === 'string') && menuJson.LunchTime.length) {
      menuItemService
        .createMenuItem({
          menuId: menu.id,
          type: 'lunch_time',
          weight: -2,
        })
        .then((menuItem) => {
          menuItemComponentService
            .createMenuItemComponent({
              menuItemId: menuItem.id,
              type: 'lunch_time',
              value: menuJson.LunchTime,
              weight: 0,
            });
        })
        .then(() => resolve(menu))
        .catch((err) => {
          logger.log('error', err);
          resolve(menu);
        });
    } else {
      resolve(menu);
    }
  });

const handleMenu = (menuJson, restaurantId, date, language) =>
  new Promise((resolve) => {
    menuService
      .createMenu({
        restaurantId,
        date,
        language,
      })
      .then(menu => handleMenuLunchTime(menu, menuJson))
      .then(menu => handleSetMenus(menu, menuJson))
      .then(() => resolve(menuJson))
      .catch((err) => {
        logger.log('error', err);
        resolve(menuJson);
      });
  });

const handleJson = (json, restaurantId, language) =>
  new Promise((resolve) => {
    if ('MenusForDays' in json && Array.isArray(json.MenusForDays) && json.MenusForDays.length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];

      json.MenusForDays.forEach((menuJson) => {
        if ('Date' in menuJson && (typeof menuJson.Date === 'string') && menuJson.Date.length) {
          const date = parse(menuJson.Date);

          operations.push(() => delay(500)
            .then(() => menuService.deleteMenusForRestaurantForDate(restaurantId, date, language))
            .then(() => handleMenu(menuJson, restaurantId, date, language))
            .catch((err) => {
              logger.log('error', err);
            }));
        }
      });

      queue.addAll(operations)
        .then(resolve(json));
    } else {
      resolve(json);
    }
  });

/**
 * Importer for Amica menus.
 * Amica menus are fetched per week using the date of monday.
 * Menus for current and next week are usually available.
 *
 * @param {Queue}   queue
 * @param {String}  identifier
 * @param {Number}  restaurantId
 * @param {String}  language
 */
const amicaImporter = (identifier, restaurantId, language) =>
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
        .then(() => fetch(getUrl(identifier, language, format(date, 'YYYY-MM-DD'))))
        .then(res => res.json())
        .then(json => handleJson(json, restaurantId, language))
        .catch((err) => {
          logger.log('error', err);
        }));
    });

    operations.push(() => importer.end(startDate, name, identifier, language));

    queue.addAll(operations)
      .then(resolve());
  });

export default amicaImporter;
