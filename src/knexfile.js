/* eslint-disable no-nested-ternary */
// eslint-disable-next-line import/no-extraneous-dependencies
require('babel-register');
require('dotenv').config({
  path: process.env.NODE_ENV === 'test'
    ? `${__dirname}/../.env.test`
    : process.env.NODE_ENV === 'production'
      ? `${__dirname}/../.env.production`
      : `${__dirname}/../.env`,
});

/**
 * Database configuration.
 */
module.exports = {
  client: process.env.DB_CLIENT,
  connection: (typeof process.env.DB_URL === 'string' && process.env.DB_URL.length)
    ? process.env.DB_URL
    : process.env.DB_CLIENT === 'sqlite'
      ? {
        filename: process.env.DB_FILE,
        charset: 'utf8',
        timezone: 'UTC',
      }
      : {
        port: process.env.DB_PORT,
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        charset: 'utf8',
        timezone: 'UTC',
      },
  migrations: {
    tableName: 'migrations',
    directory: './migrations',
    stub: './stubs/migration.stub',
  },
  seeds: {
    directory: './seeds',
    stub: './stubs/seed.stub',
  },
  useNullAsDefault: process.env.DB_CLIENT === 'sqlite',
};
