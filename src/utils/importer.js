// import fetch from 'node-fetch';
import differenceInSeconds from 'date-fns/difference_in_seconds';
import logger from '../utils/logger';
import amicaImporter from '../importers/amicaImporter';
import unirestaImporter from '../importers/unirestaImporter';

const importers = {
  amicaImporter,
  unirestaImporter,
};

export function getImporter(importerName, opts) {
  return importers[importerName](opts);
}

export function fetchJSON(url) {
  return new Promise((resolve) => {
    logger.log('info', `Fetching ${url}`);
    const e = Date.now() + 5000;
    while (Date.now() < e);
    resolve();
  });
}

export function start(importerName, identifier) {
  logger.log('info', `Starting ${importerName} for ${identifier}`);
  return Date();
}

export function end(startDate) {
  logger.log('info', `Finished in ${differenceInSeconds(Date(), startDate)} seconds`);
}
