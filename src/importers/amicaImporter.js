import logger from '../utils/logger';
import BaseImporter from './baseImporter';

class AmicaImporter extends BaseImporter {
  constructor(identifier) {
    super();
    this.identifier = identifier;
  }

  run() {
    logger.log('info', `Running AmicaImporter for ${this.identifier}`);

    AmicaImporter.fetchJson(this.identifier);
  }
}

export default AmicaImporter;
