import Boom from 'boom';
import MenuItemComponent from '../models/menuItemComponent';

/**
 * Get all menuItemComponents.
 *
 * @return {Promise}
 */
export function getAllMenuItemComponents() {
  return MenuItemComponent.fetchAll();
}

/**
 * Get a menuItemComponent.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function getMenuItemComponent(id) {
  return new MenuItemComponent({ id }).fetch().then((menuItemComponent) => {
    if (!menuItemComponent) {
      throw new Boom.notFound('MenuItemComponent not found');
    }

    return menuItemComponent;
  });
}

/**
 * Create new menuItemComponent.
 *
 * @param  {Object}  menuItemComponent
 * @return {Promise}
 */
export function createMenuItemComponent(menuItemComponent) {
  return new MenuItemComponent({
    menuItemId: menuItemComponent.menuItemId,
    value: menuItemComponent.value,
    weight: menuItemComponent.weight,
  })
    .save()
    .then(createdMenuItemComponent => createdMenuItemComponent.refresh());
}

/**
 * Update a menuItemComponent.
 *
 * @param  {Number|String}  id
 * @param  {Object}         menuItemComponent
 * @return {Promise}
 */
export function updateMenuItemComponent(id, menuItemComponent) {
  return new MenuItemComponent({ id })
    .save({
      menuItemId: menuItemComponent.menuItemId,
      value: menuItemComponent.value,
      weight: menuItemComponent.weight,
    })
    .then(updatedMenuItemComponent => updatedMenuItemComponent.refresh());
}

/**
 * Delete a menuItemComponent.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function deleteMenuItemComponent(id) {
  return new MenuItemComponent({ id })
    .fetch().then(menuItemComponent => menuItemComponent.destroy());
}
