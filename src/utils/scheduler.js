import schedule from 'node-schedule';
import logger from './logger';
import * as importService from '../services/importService';
import { getImporter } from './importer';

const scheduler = {
  scheduleImporters: (queue, cron) => schedule.scheduleJob(cron, () => {
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
