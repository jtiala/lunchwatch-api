import Knex from 'knex';

/**
 * Description
 *
 * @param {Knex} knex
 * @return {Promise}
 */
export const seed = async (knex: Knex): Promise<number[][]> =>
  await knex('table_name')
    .del()
    .then(
      (): Promise<number[][]> =>
        knex('table_name').insert([
          {
            columnOne: 'value',
            colunTwo: 'value',
          },
          {
            colName: 'value',
            colName2: 'value',
          },
        ]),
    );
