import Joi from 'joi';
import validate from '../utils/validate';
import * as menuItemComponentService from '../services/menuItemComponentService';
import MenuItemComponent from '../models/menuItemComponent';

const SCHEMA = {
  menuItemId: Joi.number()
    .label('MenuItem ID')
    .integer()
    .positive()
    .required(),
  type: Joi.string()
    .label('Type')
    .valid(MenuItemComponent.validTypes)
    .required(),
  value: Joi.string()
    .label('Value')
    .max(255),
  weight: Joi.number()
    .label('Weight')
    .integer(),
};

/**
 * Validate create/update menuItemComponent request.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 * @return {Promise}
 */
function menuItemComponentValidator(req, res, next) {
  return validate(req.body, SCHEMA)
    .then(() => next())
    .catch(err => next(err));
}

/**
 * Validate menuItemComponent existence.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 * @return {Promise}
 */
function findMenuItemComponent(req, res, next) {
  return menuItemComponentService
    .getMenuItemComponent(req.params.id)
    .then(() => next())
    .catch(err => next(err));
}

export { menuItemComponentValidator, findMenuItemComponent };
