import Joi from 'joi';
import validate from '../utils/validate';
import * as importService from '../services/importService';

const SCHEMA = {
  lastImportAt: Joi.date()
    .label('Last Import At')
    .iso()
    .required(),
  importer: Joi.string()
    .label('Importer')
    .required(),
  schedule: Joi.string()
    .label('Schedule')
    .required(),
  identifier: Joi.string()
    .label('Identifier')
    .required(),
  restaurantId: Joi.number()
    .label('Restaurant ID')
    .integer()
    .positive()
    .required(),
};

/**
 * Validate create/update import request.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 * @return {Promise}
 */
function importValidator(req, res, next) {
  return validate(req.body, SCHEMA)
    .then(() => next())
    .catch(err => next(err));
}

/**
 * Validate import existence.
 *
 * @param  {object}   req
 * @param  {object}   res
 * @param  {function} next
 * @return {Promise}
 */
function findImport(req, res, next) {
  return importService
    .getImport(req.params.id)
    .then(() => next())
    .catch(err => next(err));
}

export { importValidator, findImport };
