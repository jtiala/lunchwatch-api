require('babel-register');
require('dotenv').config({ path: __dirname + '/../.env' });

/**
 * Database configuration.
 */
module.exports = {
  client: process.env.NODE_ENV === 'test' ? process.env.TEST_DB_CLIENT : process.env.DB_CLIENT,
  connection:
    process.env.NODE_ENV === 'test'
      ? {
          port: process.env.TEST_DB_PORT,
          host: process.env.TEST_DB_HOST,
          user: process.env.TEST_DB_USER,
          password: process.env.TEST_DB_PASSWORD,
          database: process.env.TEST_DB_NAME,
          charset: 'utf8',
          timezone: 'UTC'
        }
      : {
          port: process.env.DB_PORT,
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          charset: 'utf8',
          timezone: 'UTC'
        },
  migrations: {
    tableName: 'migrations',
    directory: './migrations',
    stub: './stubs/migration.stub'
  },
  seeds: {
    directory: './seeds',
    stub: './stubs/seed.stub'
  }
};
