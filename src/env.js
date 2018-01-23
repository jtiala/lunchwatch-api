/* eslint-disable no-nested-ternary */
import dotenv from 'dotenv';

/**
 * Initialize environment variables.
 */
dotenv.config({
  path: process.env.NODE_ENV === 'test'
    ? `${__dirname}/../.env.test`
    : process.env.NODE_ENV === 'production'
      ? `${__dirname}/../.env.production`
      : `${__dirname}/../.env`,
});
