import schedule from 'node-schedule';
import Queue from 'promise-queue';
import logger from './logger';
import * as importService from '../services/importService';
import { getImporter } from './importer';

const scheduler = {
  scheduleImporters: cron => schedule.scheduleJob(cron, () => {
    const maxConcurrent = 1;
    const maxQueue = Infinity;
    const queue = new Queue(maxConcurrent, maxQueue);

    importService
      .getAllImports()
      .then((imports) => {
        imports.forEach((imp) => {
          queue.add(() => getImporter(imp.get('importer'), imp.get('identifier')));
        });
      })
      .catch(err => logger.log('error', err));
  }),
};

export default scheduler;
