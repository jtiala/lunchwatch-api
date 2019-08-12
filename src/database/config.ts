require('dotenv').config({ path: '../../.env' });

import Knex from 'knex';

const config: Knex.Config = {
  client: process.env.DB_CLIENT,
  connection: {
    host: String(process.env.DB_HOST),
    port: Number(process.env.DB_PORT),
    user: String(process.env.DB_USER),
    password: String(process.env.DB_PASSWORD),
    database: String(process.env.DB_NAME),
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
