import differenceInSeconds from 'date-fns/difference_in_seconds';
import logger from '../utils/logger';
import amicaImporter from '../importers/amicaImporter';
import unirestaImporter from '../importers/unirestaImporter';

const importers = {
  amicaImporter,
  unirestaImporter,
};

export function getImporter(importerName, identifier, restaurantId, language) {
  return importers[importerName](identifier, restaurantId, language);
}

export function start(importerName, identifier, language) {
  logger.log('info', `Starting ${importerName} for ${identifier} in ${language}`);
  return Date();
}

export function end(startDate) {
  logger.log('info', `Finished in ${differenceInSeconds(Date(), startDate)} seconds`);
}
