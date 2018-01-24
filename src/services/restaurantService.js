import Boom from 'boom';
import Restaurant from '../models/restaurant';

/**
 * Search restaurants.
 *
 * @param  {Object}  searchParams
 * @return {Promise}
 */
export function searchRestaurants(searchParams) {
  const search = {
    enabled: true,
  };

  let page = 1;
  let pageSize = 10;

  if ('page' in searchParams && searchParams.page.length) {
    page = parseInt(searchParams.page, 10);
  }

  if ('pageSize' in searchParams && searchParams.pageSize.length) {
    pageSize = parseInt(searchParams.pageSize, 10);
  }

  if ('chain' in searchParams && searchParams.chain.length) {
    search.chain = searchParams.chain;
  }

  if ('enabled' in searchParams && searchParams.enabled.length) {
    search.enabled = searchParams.enabled;
  }

  return Restaurant.where(search).orderBy('id').fetchPage({
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
