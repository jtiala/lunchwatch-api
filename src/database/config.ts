require('dotenv').config({ path: '../../.env' });

import Knex from 'knex';

const config: Knex.Config = {
  client: process.env.DB_CLIENT,
  connection: {
    host: 'db',
    port: 5432,
    user: 'lunchwatch',
    password: 'lunchwatch',
    database: 'lunchwatch',
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: './migrations',
    tableName: 'migrations',
    stub: './stubs/migration.ts',
  },
  seeds: {
    directory: './seeds',
    stub: './stubs/seed.ts',
  },
};

export default config;
