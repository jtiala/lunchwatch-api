import schedule from 'node-schedule';
import logger from './logger';
import * as importService from '../services/importService';
import { importer } from './importer';

const scheduler = {
  scheduleImporters: (queue, cron) => schedule.scheduleJob(cron, () => {
    importService
      .getEnabledImports()
      .then((imports) => {
        imports.forEach((imp) => {
          queue.add(() => importer(imp.get('importer'), imp.get('identifier'), imp.get('restaurantId'), imp.get('language')));
        });
      })
      .catch(err => logger.log('error', err));
  }),
};

export default scheduler;
