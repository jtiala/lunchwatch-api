import fs from 'fs';
import winston, { Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir = process.env.APP_LOG_DIR || 'logs';

export const createLogDir = async (): Promise<void> => {
  if (!(await fs.existsSync(logDir))) {
    await fs.mkdirSync(logDir);
  }
};

export const createLogger = (): Logger => {
  const { printf, combine, timestamp } = winston.format;

  const format = printf(({ level, message, timestamp, service }): string => {
    return `[${timestamp}] ${level.toUpperCase()} [${service}] ${message}`;
  });

  return winston.createLogger({
    level: 'info',
    format: combine(timestamp(), format),
    defaultMeta: { service: 'App' },
    transports: [
      new DailyRotateFile({
        dirname: logDir,
        filename: '%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'info',
      }),
    ],
  });
};
