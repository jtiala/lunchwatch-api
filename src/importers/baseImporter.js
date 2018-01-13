// import fetch from 'node-fetch';
import logger from '../utils/logger';

class BaseImporter {
  run() {
    logger.log('info', `Running ${this}`);
  }

  static fetchJson(url) {
    logger.log('info', `Fetching ${url}`);
  }
}

export default BaseImporter;
