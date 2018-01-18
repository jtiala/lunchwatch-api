import differenceInSeconds from 'date-fns/difference_in_seconds';
import logger from '../utils/logger';
import amicaImporter from '../importers/amicaImporter';
import unirestaImporter from '../importers/unirestaImporter';

const importers = {
  amicaImporter,
  unirestaImporter,
};

export const importer = (importerName, identifier, restaurantId, language) =>
  importers[importerName](identifier, restaurantId, language);

export const start = (importerName, identifier, language) =>
  new Promise((resolve) => {
    logger.log('info', `Starting ${importerName}/${identifier}/${language}`);
    resolve();
  });

export const end = (startDate, importerName, identifier, language) =>
  new Promise((resolve) => {
    logger.log('info', `Finished ${importerName}/${identifier}/${language} in ${differenceInSeconds(Date(), startDate)} seconds`);
    resolve();
  });
