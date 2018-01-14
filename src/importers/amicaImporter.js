import * as importer from '../utils/importer';
import logger from '../utils/logger';

const name = 'amicaImporter';

function url(identifier, language, date) {
  return `https://www.amica.fi/modules/json/json/Index?costNumber=${identifier}&language=${language}&firstDay=${date}`;
}

function amicaImporter(identifier) {
  const start = importer.start(name, identifier);

  importer.fetchJSON(url(identifier, 'fi', '2018-01-01'))
    .then(() => {
      importer.end(start);
    })
    .catch(err => logger.log('error', err));
}

export default amicaImporter;
