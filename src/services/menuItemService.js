import Boom from 'boom';
import MenuItem from '../models/menuItem';

/**
 * Get all menuItems.
 *
 * @return {Promise}
 */
export function getAllMenuItems() {
  return MenuItem.fetchAll();
}

/**
 * Get a menuItem.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function getMenuItem(id) {
  return new MenuItem({ id }).fetch().then((menuItem) => {
    if (!menuItem) {
      throw Boom.notFound('MenuItem not found');
    }

    return menuItem;
  });
}

/**
 * Create new menuItem.
 *
 * @param  {Object}  menuItem
 * @return {Promise}
 */
export function createMenuItem(menuItem) {
  return new MenuItem({
    menuId: menuItem.menuId,
    type: menuItem.type,
    weight: menuItem.weight,
  })
    .save()
    .then(createdMenuItem => createdMenuItem.refresh());
}

/**
 * Update a menuItem.
 *
 * @param  {Number|String}  id
 * @param  {Object}         menuItem
 * @return {Promise}
 */
export function updateMenuItem(id, menuItem) {
  return new MenuItem({ id })
    .save({
      menuId: menuItem.menuId,
      type: menuItem.type,
      weight: menuItem.weight,
    })
    .then(updatedMenuItem => updatedMenuItem.refresh());
}

/**
 * Delete a menuItem.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function deleteMenuItem(id) {
  return new MenuItem({ id }).fetch().then(menuItem => menuItem.destroy());
}
