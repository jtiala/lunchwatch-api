import Knex from 'knex';

import { SlackToken, SlackConfiguration } from './interfaces';

export const getToken = async (
  db: Knex,
  id: number,
): Promise<SlackToken | undefined> =>
  await db<SlackToken>('slack_tokens')
    .where('id', id)
    .then((tokens): SlackToken => tokens[0])
    .catch((): undefined => undefined);

export const getTokenByTeamId = async (
  db: Knex,
  teamId: number,
): Promise<SlackToken | undefined> =>
  await db<SlackToken>('slack_tokens')
    .where('team_id', teamId)
    .then((tokens): SlackToken => tokens[0])
    .catch((): undefined => undefined);

export const createToken = async (
  db: Knex,
  accessToken: string,
  scope: string,
  teamName: string,
  teamId: string,
): Promise<SlackToken | void> => {
  const createdToken = await db<SlackToken>('slack_tokens')
    .returning('id')
    .insert({
      access_token: accessToken,
      scope,
      team_name: teamName,
      team_id: teamId,
    })
    .catch((): [] => []);

  const tokenId = createdToken[0];

  if (tokenId) {
    return await getToken(db, tokenId);
  }
};

export const updateToken = async (
  db: Knex,
  id: number,
  accessToken: string,
  scope: string,
  teamName: string,
  teamId: string,
): Promise<SlackToken | void> => {
  await db<SlackToken>('slack_tokens')
    .where('id', id)
    .update({
      access_token: accessToken,
      scope,
      team_name: teamName,
      team_id: teamId,
      updated_at: new Date(),
    })
    .catch((): [] => []);

  return await getToken(db, id);
};

export const deleteToken = async (db: Knex, id: number): Promise<number> =>
  await db<SlackToken>('slack_tokens')
    .where('id', id)
    .delete()
    .catch((): number => 0);

export const getConfiguration = async (
  db: Knex,
  id: number,
): Promise<SlackConfiguration | undefined> =>
  await db<SlackConfiguration>('slack_configurations')
    .where('id', id)
    .then((tokens): SlackConfiguration => tokens[0])
    .catch((): undefined => undefined);

export const getConfigurationByTeamAndChannel = async (
  db: Knex,
  teamId: string,
  channelId: string,
): Promise<SlackConfiguration | undefined> =>
  await db<SlackConfiguration>('slack_configurations')
    .where({
      team_id: teamId,
      channel_id: channelId,
    })
    .then((tokens): SlackConfiguration => tokens[0])
    .catch((): undefined => undefined);

export const createConfiguration = async (
  db: Knex,
  teamId: string,
  channelId: string,
  restaurantIds?: number[],
  lat?: number,
  lng?: number,
  limit?: number,
  language?: string,
): Promise<SlackConfiguration | void> => {
  const createdConfiguration = await db<SlackConfiguration>(
    'slack_configurations',
  )
    .returning('id')
    .insert({
      team_id: teamId,
      channel_id: channelId,
      lat,
      lng,
      restaurant_ids: Array.isArray(restaurantIds)
        ? restaurantIds.join(',')
        : undefined,
      limit,
      language,
    })
    .catch((): [] => []);

  const configurationId = createdConfiguration[0];

  if (configurationId) {
    return await getConfiguration(db, configurationId);
  }
};

export const deleteConfiguration = async (
  db: Knex,
  id: number,
): Promise<number> =>
  await db<SlackConfiguration>('slack_configurations')
    .where('id', id)
    .delete()
    .catch((): number => 0);

export const updateConfiguration = async (
  db: Knex,
  id: number,
  teamId: string,
  channelId: string,
  restaurantIds?: number[],
  lat?: number,
  lng?: number,
  limit?: number,
  language?: string,
): Promise<SlackConfiguration | void> => {
  await db<SlackConfiguration>('slack_configurations')
    .where('id', id)
    .update({
      team_id: teamId,
      channel_id: channelId,
      updated_at: new Date(),
    })
    .update(
      'restaurant_ids',
      Array.isArray(restaurantIds) ? restaurantIds.join(',') : db.raw('NULL'),
    )
    .update('lat', lat && lng ? lat : db.raw('NULL'))
    .update('lng', lat && lng ? lng : db.raw('NULL'))
    .update('limit', limit ? limit : db.raw('NULL'))
    .update('language', language ? language : db.raw('NULL'))
    .catch((): [] => []);

  return await getConfiguration(db, id);
};
