import Boom from 'boom';
import Restaurant from '../models/restaurant';

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
