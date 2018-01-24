import delay from 'delay';
import fetch from 'node-fetch';
import Queue from 'p-queue';
import Promise from 'bluebird';
import { startOfWeek, addWeeks, format, parse } from 'date-fns';
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

const handleMenuItemComponent = (menuItem, setMenuComponentData, weight) =>
  new Promise((resolve) => {
    menuItemComponentService
      .createMenuItemComponent({
        menuItemId: menuItem.id,
        type: 'food_item',
        value: importer.normalizeString(setMenuComponentData),
        weight,
      })
      .then(() => resolve(menuItem))
      .catch((err) => {
        logger.log('error', err);
        resolve(menuItem);
      });
  });

const handleMenuItemComponents = (menuItem, setMenuData) =>
  new Promise((resolve) => {
    if ('Components' in setMenuData && Array.isArray(setMenuData.Components) && setMenuData.Components.length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];
      let count = 0;

      setMenuData.Components.forEach((setMenuComponentData) => {
        if ((typeof setMenuComponentData === 'string') && setMenuComponentData.length) {
          count += 1;
          const weight = count;
          operations.push(() => delay(500)
            .then(() => handleMenuItemComponent(menuItem, setMenuComponentData, weight))
            .catch(err => logger.log('error', err)));
        }
      });

      queue.addAll(operations)
        .then(resolve(menuItem));
    } else {
      resolve(menuItem);
    }
  });

const handleMenuItemPrice = (menuItem, setMenuData) =>
  new Promise((resolve) => {
    if ('Price' in setMenuData && (typeof setMenuData.Price === 'string') && setMenuData.Price.length) {
      menuItemComponentService
        .createMenuItemComponent({
          menuItemId: menuItem.id,
          type: 'price_information',
          value: importer.normalizeString(setMenuData.Price),
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

const handleMenuItemName = (menuItem, setMenuData) =>
  new Promise((resolve) => {
    if ('Name' in setMenuData && (typeof setMenuData.Name === 'string') && setMenuData.Name.length) {
      menuItemComponentService
        .createMenuItemComponent({
          menuItemId: menuItem.id,
          type: 'name',
          value: importer.normalizeString(setMenuData.Name),
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

const handleSetMenu = (menu, setMenuData, weight) =>
  new Promise((resolve) => {
    menuItemService
      .createMenuItem({
        menuId: menu.id,
        type: importer.getMenuItemTypeFromString(setMenuData.Name),
        weight,
      })
      .then(menuItem => handleMenuItemName(menuItem, setMenuData))
      .then(menuItem => handleMenuItemPrice(menuItem, setMenuData))
      .then(menuItem => handleMenuItemComponents(menuItem, setMenuData))
      .then(() => resolve(menu))
      .catch((err) => {
        logger.log('error', err);
        resolve(menu);
      });
  });

const handleSetMenus = (menu, menuData) =>
  new Promise((resolve) => {
    if ('SetMenus' in menuData && Array.isArray(menuData.SetMenus) && menuData.SetMenus.length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];
      let count = 0;

      menuData.SetMenus.forEach((setMenuData) => {
        count += 1;
        const weight = count;

        operations.push(() => delay(500)
          .then(() => handleSetMenu(menu, setMenuData, weight))
          .catch(err => logger.log('error', err)));
      });

      queue.addAll(operations)
        .then(resolve(menu));
    } else {
      resolve(menu);
    }
  });

const handleMenuLunchTime = (menu, menuData) =>
  new Promise((resolve) => {
    if ('LunchTime' in menuData && (typeof menuData.LunchTime === 'string') && menuData.LunchTime.length) {
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
              value: importer.normalizeString(menuData.LunchTime),
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

const handleMenu = (menuData, restaurantId, date, language) =>
  new Promise((resolve) => {
    menuService
      .createMenu({
        restaurantId,
        date,
        language,
      })
      .then(menu => handleMenuLunchTime(menu, menuData))
      .then(menu => handleSetMenus(menu, menuData))
      .then(() => resolve(menuData))
      .catch((err) => {
        logger.log('error', err);
        resolve(menuData);
      });
  });

const handleJson = (data, restaurantId, language) =>
  new Promise((resolve) => {
    if ('MenusForDays' in data && Array.isArray(data.MenusForDays) && data.MenusForDays.length) {
      const queue = new Queue({
        concurrency: 1,
        autoStart: true,
      });

      const operations = [];

      data.MenusForDays.forEach((menuData) => {
        if ('Date' in menuData && (typeof menuData.Date === 'string') && menuData.Date.length) {
          const date = parse(menuData.Date);

          operations.push(() => delay(500)
            .then(() => menuService.deleteMenusForRestaurantForDate(restaurantId, date, language))
            .then(() => handleMenu(menuData, restaurantId, date, language))
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
 * Importer for Amica menus.
 * Amica menus are fetched per week using the date of monday.
 * Menus for current and next week are usually available.
 *
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
        .catch(err => logger.log('error', err)));
    });

    operations.push(() => importer.end(startDate, name, identifier, language));

    queue.addAll(operations)
      .then(resolve());
  });

export default amicaImporter;
