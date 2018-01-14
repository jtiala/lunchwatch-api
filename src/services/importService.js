import Boom from 'boom';
import Import from '../models/import';

/**
 * Get all imports.
 *
 * @return {Promise}
 */
export function getAllImports() {
  return Import.fetchAll();
}

/**
 * Get enabled imports.
 *
 * @return {Promise}
 */
export function getEnabledImports() {
  return Import.where({ enabled: true }).fetchAll();
}

/**
 * Get a import.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function getImport(id) {
  return new Import({ id }).fetch().then((imp) => {
    if (!imp) {
      throw Boom.notFound('Import not found');
    }

    return imp;
  });
}

/**
 * Create new import.
 *
 * @param  {Object}  import
 * @return {Promise}
 */
export function createImport(imp) {
  return new Import({
    lastImportAt: imp.lastImportAt,
    importer: imp.importer,
    identifier: imp.identifier,
    restaurantId: imp.restaurantId,
    language: imp.language,
    enabled: imp.enabled,
  })
    .save()
    .then(createdImport => createdImport.refresh());
}

/**
 * Update a import.
 *
 * @param  {Number|String}  id
 * @param  {Object}         import
 * @return {Promise}
 */
export function updateImport(id, imp) {
  return new Import({ id })
    .save({
      lastImportAt: imp.lastImportAt,
      importer: imp.importer,
      identifier: imp.identifier,
      restaurantId: imp.restaurantId,
      language: imp.language,
      enabled: imp.enabled,
    })
    .then(updatedImport => updatedImport.refresh());
}

/**
 * Delete a import.
 *
 * @param  {Number|String}  id
 * @return {Promise}
 */
export function deleteImport(id) {
  return new Import({ id }).fetch().then(imp => imp.destroy());
}
