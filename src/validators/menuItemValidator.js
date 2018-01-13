import Joi from 'joi';
import validate from '../utils/validate';
import * as menuItemService from '../services/menuItemService';
import MenuItem from '../models/menuItem';

const SCHEMA = {
  menuId: Joi.number()
    .label('Menu ID')
    .integer()
    .positive()
    .required(),
  type: Joi.string()
    .label('Type')
    .valid(MenuItem.validTypes)
    .required(),
  name: Joi.string()
    .label('Name')
    .max(255),
  price: Joi.string()
    .label('Price')
    .max(255),
  weight: Joi.number()
    .label('Weight')
    .integer(),
};

/**
 * Validate create/update menuItem request.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 * @return {Promise}
 */
function menuItemValidator(req, res, next) {
  return validate(req.body, SCHEMA)
    .then(() => next())
    .catch(err => next(err));
}

/**
 * Validate menuItem existence.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 * @return {Promise}
 */
function findMenuItem(req, res, next) {
  return menuItemService
    .getMenuItem(req.params.id)
    .then(() => next())
    .catch(err => next(err));
}

export { menuItemValidator, findMenuItem };
