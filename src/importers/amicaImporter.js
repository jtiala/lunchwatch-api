import fetch from 'node-fetch';
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
function getUrl(identifier, language, date) {
  return `https://www.amica.fi/modules/json/json/Index?costNumber=${identifier}&language=${language}&firstDay=${date}`;
}

/**
 * Import json.
 *
 * @param {Object}  json
 * @param {Number}  restaurantId
 * @param {String}  language
 */
function importJson(json, restaurantId, language) {
  if ('MenusForDays' in json && Array.isArray(json.MenusForDays) && json.MenusForDays.length) {
    json.MenusForDays.forEach((menuForDay) => {
      if ('Date' in menuForDay && (typeof menuForDay.Date === 'string') && menuForDay.Date.length) {
        const date = parse(menuForDay.Date);

        // delete old menu
        menuService
          .deleteMenusForRestaurantForDate(restaurantId, date, language)
          .catch(err => logger.log('error', err))
          .then(() => {
            // create menu
            menuService
              .createMenu({
                restaurantId,
                date,
                language,
              })
              .then((menu) => {
                // create menuItem and menuItemComponent for lunch time
                if ('LunchTime' in menuForDay && (typeof menuForDay.LunchTime === 'string') && menuForDay.LunchTime.length) {
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
                          value: menuForDay.LunchTime,
                          weight: 0,
                        })
                        .catch(err => logger.log('error', err));
                    })
                    .catch(err => logger.log('error', err));
                }

                if ('SetMenus' in menuForDay && Array.isArray(menuForDay.SetMenus)) {
                  let menuItemWeight = 0;

                  menuForDay.SetMenus.forEach((setMenu) => {
                    // create menuItem for a meal
                    menuItemService
                      .createMenuItem({
                        menuId: menu.id,
                        type: 'normal_meal',
                        weight: menuItemWeight += 1,
                      })
                      .then((menuItem) => {
                        // create menuItemComponent for name
                        if ('Name' in setMenu && (typeof setMenu.Name === 'string') && setMenu.Name.length) {
                          menuItemComponentService
                            .createMenuItemComponent({
                              menuItemId: menuItem.id,
                              type: 'name',
                              value: setMenu.Name,
                              weight: -2,
                            })
                            .catch(err => logger.log('error', err));
                        }

                        // create menuItemComponent for price
                        if ('Price' in setMenu && (typeof setMenu.Price === 'string') && setMenu.Price.length) {
                          menuItemComponentService
                            .createMenuItemComponent({
                              menuItemId: menuItem.id,
                              type: 'price_information',
                              value: setMenu.Price,
                              weight: -1,
                            })
                            .catch(err => logger.log('error', err));
                        }

                        if ('Components' in setMenu && Array.isArray(setMenu.Components)) {
                          let menuItemComponentWeight = 0;

                          setMenu.Components.forEach((setMenuComponent) => {
                            // create menuItemComponent for component
                            if ((typeof setMenuComponent === 'string') && setMenuComponent.length) {
                              menuItemComponentService
                                .createMenuItemComponent({
                                  menuItemId: menuItem.id,
                                  type: 'food_item',
                                  value: setMenuComponent,
                                  weight: menuItemComponentWeight += 1,
                                })
                                .catch(err => logger.log('error', err));
                            }
                          });
                        }
                      })
                      .catch(err => logger.log('error', err));
                  });
                }
              })
              .catch(err => logger.log('error', err));
          });
      }
    });
  }
}

/**
 * Importer for Amica menus.
 * Amica menus are fetched per week using the date of monday.
 * Menus for current and next week are usually available.
 *
 * @param {String}  identifier
 * @param {Number}  restaurantId
 * @param {String}  language
 */
function amicaImporter(identifier, restaurantId, language) {
  const start = importer.start(name, identifier, language);

  const thisMonday = startOfWeek(Date(), { weekStartsOn: 1 });
  const nextMonday = addWeeks(thisMonday, 1);

  [thisMonday, nextMonday].forEach((date) => {
    fetch(getUrl(identifier, language, format(date, 'YYYY-MM-DD')))
      .then(res => res.json())
      .then(json => importJson(json, restaurantId, language))
      .catch(err => logger.log('error', err));
  });

  importer.end(start);
}

export default amicaImporter;
