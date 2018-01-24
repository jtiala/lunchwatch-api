import Boom from 'boom';
import subWeeks from 'date-fns/sub_weeks';
import bookshelf from '../db';
import Menu from '../models/menu';

/**
 * Search menus.
 *
 * @param  {Object}  searchParams
 * @return {Promise}
 */
export function searchMenus(searchParams) {
  const columns = ['menus.*'];
  const restaurantColumns = ['*'];
  const conditions = { 'restaurants.enabled': true };

  let order = 'restaurants.id';
  let page = 1;
  let pageSize = 10;

  if ('page' in searchParams && searchParams.page.length) {
    page = parseInt(searchParams.page, 10);
  }

  if ('pageSize' in searchParams && searchParams.pageSize.length) {
    pageSize = parseInt(searchParams.pageSize, 10);
  }

  if ('restaurantId' in searchParams && searchParams.restaurantId.length) {
    conditions['restaurants.id'] = searchParams.restaurantId;
  }

  if ('date' in searchParams && searchParams.date.length) {
    conditions['menus.date'] = searchParams.date;
  }

  if ('language' in searchParams && searchParams.language.length) {
    conditions['menus.language'] = searchParams.language;
  }

  if ('lat' in searchParams && searchParams.lat.length
    && 'lng' in searchParams && searchParams.lng.length) {
    const sql = `((2 * 3961 * asin(sqrt((sin(radians((restaurants.lat - ${parseFloat(searchParams.lat)}) / 2))) ^ 2 + cos(radians(${parseFloat(searchParams.lat)})) * cos(radians(restaurants.lat)) * (sin(radians((restaurants.lng - ${parseFloat(searchParams.lng)}) / 2))) ^ 2))) * 1.60934)`;
    order = bookshelf.knex.raw(sql);
    restaurantColumns.push(bookshelf.knex.raw(`${sql} AS distance`));
  }

  return Menu.query((qb) => {
    qb.select(columns).leftJoin('restaurants', 'menus.restaurant_id', 'restaurants.id').where(conditions).orderBy(order);
  })
    .fetchPage({
      page,
      pageSize,
      withRelated: [
        { restaurant: qb => qb.select(restaurantColumns) },
        { menuItems: query => query.orderBy('weight') },
        { 'menuItems.menuItemComponents': query => query.orderBy('weight') },
      ],
    });
}

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
  return new Menu({ id }).fetch({
    withRelated: [
      { menuItems: query => query.orderBy('weight') },
      { 'menuItems.menuItemComponents': query => query.orderBy('weight') },
    ],
  }).then((menu) => {
    if (!menu) {
      throw Boom.notFound('Menu not found');
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

/**
 * Delete all menus for specific restaurant for specific date.
 *
 * @param  {Number|String}  restaurantId
 * @param  {String}         date
 * @param  {String}         language
 * @return {Promise}
 */
export function deleteMenusForRestaurantForDate(restaurantId, date, language) {
  return Menu.where({ restaurant_id: restaurantId, date, language })
    .fetchAll().then(menus => menus.map(menu => menu.destroy()));
}

/**
 * Delete all menus that are older than four weeks.
 *
 * @return {Promise}
 */
export function deleteOldMenus() {
  return Menu.where('date', '<', subWeeks(Date(), 4))
    .fetchAll().then(menus => menus.map(menu => menu.destroy()));
}
