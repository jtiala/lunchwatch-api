import Joi from 'joi';
import validate from '../utils/validate';
import * as restaurantService from '../services/restaurantService';

const SCHEMA = {
  name: Joi.string()
    .label('Name')
    .max(128)
    .required(),
  chain: Joi.string()
    .label('Chain')
    .max(128),
  url: Joi.string()
    .label('URL')
    .max(255),
};

/**
 * Validate create/update restaurant request.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 * @return {Promise}
 */
function restaurantValidator(req, res, next) {
  return validate(req.body, SCHEMA)
    .then(() => next())
    .catch(err => next(err));
}

/**
 * Validate restaurant existence.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 * @return {Promise}
 */
function findRestaurant(req, res, next) {
  return restaurantService
    .getRestaurant(req.params.id)
    .then(() => next())
    .catch(err => next(err));
}

export { restaurantValidator, findRestaurant };
