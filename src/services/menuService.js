import Boom from 'boom';
import Menu from '../models/menu';

/**
 * Get all menus.
 *
 * @return {Promise}
 */
export function getAllMenus() {
  return Menu.fetchAll();
}

/**
 * Get a menu.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function getMenu(id) {
  return new Menu({ id }).fetch().then((menu) => {
    if (!menu) {
      throw new Boom.notFound('Menu not found');
    }

    return menu;
  });
}

/**
 * Create new menu.
 *
 * @param  {Object}  menu
 * @return {Promise}
 */
export function createMenu(menu) {
  return new Menu({
    restaurantId: menu.restaurantId,
    date: menu.date,
    language: menu.language,
  })
    .save()
    .then(createdMenu => createdMenu.refresh());
}

/**
 * Update a menu.
 *
 * @param  {Number|String}  id
 * @param  {Object}         menu
 * @return {Promise}
 */
export function updateMenu(id, menu) {
  return new Menu({ id })
    .save({
      restaurantId: menu.restaurantId,
      date: menu.date,
      language: menu.language,
    })
    .then(updatedMenu => updatedMenu.refresh());
}

/**
 * Delete a menu.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function deleteMenu(id) {
  return new Menu({ id }).fetch().then(menu => menu.destroy());
}
