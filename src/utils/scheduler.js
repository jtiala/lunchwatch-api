import schedule from 'node-schedule';

const scheduler = {
  scheduleJob: (job, cron) => schedule.scheduleJob(cron, () => {
    job.run();
  }),
};

export default scheduler;
