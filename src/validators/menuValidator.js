import Joi from 'joi';
import validate from '../utils/validate';
import * as menuService from '../services/menuService';

const SCHEMA = {
  restaurantId: Joi.number()
    .label('Restaurant ID')
    .integer()
    .positive()
    .required(),
  date: Joi.date()
    .label('Date')
    .iso()
    .required(),
  language: Joi.string()
    .label('Language')
    .max(2)
    .required(),
};

/**
 * Validate create/update menu request.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 * @return {Promise}
 */
function menuValidator(req, res, next) {
  return validate(req.body, SCHEMA)
    .then(() => next())
    .catch(err => next(err));
}

/**
 * Validate menu existence.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 * @return {Promise}
 */
function findMenu(req, res, next) {
  return menuService
    .getMenu(req.params.id)
    .then(() => next())
    .catch(err => next(err));
}

export { menuValidator, findMenu };
