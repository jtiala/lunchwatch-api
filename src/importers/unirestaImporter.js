import * as importer from '../utils/importer';
import logger from '../utils/logger';

const name = 'unirestaImporter';

function urlFi(identifier) {
  return `https://www.uniresta.fi/ruokalistat/${identifier}.json`;
}

// eslint-disable-next-line no-unused-vars
function urlEn(identifier, week) {
  return `http://www.uniresta.fi/en/ajax-lunchlist/vk-${week}-ruokalista-${identifier}.json`;
}

function unirestaImporter(identifier) {
  const start = importer.start(name, identifier);

  importer.fetchJSON(urlFi(identifier))
    .then(() => {
      importer.end(start);
    })
    .catch(err => logger.log('error', err));
}

export default unirestaImporter;
