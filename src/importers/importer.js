import BaseImporter from './baseImporter';
import AmicaImporter from './amicaImporter';

const importers = {
  BaseImporter,
  AmicaImporter,
};

class Importer {
  constructor(importerName, opts) {
    return new importers[importerName](opts);
  }
}

export default Importer;
