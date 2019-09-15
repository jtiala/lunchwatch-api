import Knex from 'knex';

/**
 * Create slack_tokens table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('slack_tokens', (table): void => {
    table.increments();
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table.string('access_token').notNullable();
    table.string('scope').notNullable();
    table.string('team_name').notNullable();
    table
      .string('team_id')
      .notNullable()
      .unique();
  });

  await knex.schema.createTable('slack_configurations', (table): void => {
    table.increments();
    table
      .timestamp('created_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table
      .timestamp('updated_at')
      .notNullable()
      .defaultTo(knex.fn.now());
    table.string('team_id').notNullable();
    table.string('channel_id').notNullable();
    table.specificType('lat', 'float8');
    table.specificType('lng', 'float8');
    table.string('restaurant_ids');
    table.integer('limit');
    table.string('language');
    table.unique(['team_id', 'channel_id']);
  });
};

/**
 * Drop restaurants table.
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTable('slack_tokens');
  await knex.schema.dropTable('slack_configurations');
};
