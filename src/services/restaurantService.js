import Boom from 'boom';
import bookshelf from '../db';
import Restaurant from '../models/restaurant';

/**
 * Search restaurants.
 *
 * @param  {Object}  searchParams
 * @return {Promise}
 */
export function searchRestaurants(searchParams) {
  const columns = ['*'];
  const conditions = { enabled: true };

  let order = 'id';
  let page = 1;
  let pageSize = 10;

  if ('page' in searchParams && searchParams.page.length) {
    page = parseInt(searchParams.page, 10);
  }

  if ('pageSize' in searchParams && searchParams.pageSize.length) {
    pageSize = parseInt(searchParams.pageSize, 10);
  }

  if ('chain' in searchParams && searchParams.chain.length) {
    conditions.chain = searchParams.chain;
  }

  if ('enabled' in searchParams && searchParams.enabled.length) {
    conditions.enabled = searchParams.enabled;
  }

  if ('lat' in searchParams && searchParams.lat.length
    && 'lng' in searchParams && searchParams.lng.length) {
    columns.push(bookshelf.knex.raw(`((2 * 3961 * asin(sqrt((sin(radians((lat - ${parseFloat(searchParams.lat)}) / 2))) ^ 2 + cos(radians(${parseFloat(searchParams.lat)})) * cos(radians(lat)) * (sin(radians((lng - ${parseFloat(searchParams.lng)}) / 2))) ^ 2))) * 1.60934) AS distance`));
    order = 'distance';
  }

  return Restaurant.query((qb) => {
    qb.select(columns).where(conditions).orderBy(order);
  }).fetchPage({
    page,
    pageSize,
  });
}

/**
 * Get all restaurants.
 *
 * @return {Promise}
 */
export function getAllRestaurants() {
  return Restaurant.fetchAll();
}

/**
 * Get a restaurant.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function getRestaurant(id) {
  return new Restaurant({ id }).fetch({ withRelated: ['menus'] }).then((restaurant) => {
    if (!restaurant) {
      throw Boom.notFound('Restaurant not found');
    }

    return restaurant;
  });
}

/**
 * Create new restaurant.
 *
 * @param  {Object}  restaurant
 * @return {Promise}
 */
export function createRestaurant(restaurant) {
  return new Restaurant({
    name: restaurant.name,
    chain: restaurant.chain,
    url: restaurant.url,
  })
    .save()
    .then(createdRestaurant => createdRestaurant.refresh());
}

/**
 * Update a restaurant.
 *
 * @param  {Number|String}  id
 * @param  {Object}         restaurant
 * @return {Promise}
 */
export function updateRestaurant(id, restaurant) {
  return new Restaurant({ id })
    .save({
      name: restaurant.name,
      chain: restaurant.chain,
      url: restaurant.url,
    })
    .then(updatedRestaurant => updatedRestaurant.refresh());
}

/**
 * Delete a restaurant.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function deleteRestaurant(id) {
  return new Restaurant({ id }).fetch().then(restaurant => restaurant.destroy());
}
