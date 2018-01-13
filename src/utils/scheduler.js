import schedule from 'node-schedule';
import logger from '../utils/logger';

const scheduler = {
  scheduleJob: job => schedule.scheduleJob('* * * * *', () => {
    logger.log('info', job);
  }),
};

export default scheduler;
