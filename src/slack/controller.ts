import Knex from 'knex';
import Boom from '@hapi/boom';
import { Router, Request, Response } from 'express';
import fetch, { Response as FetchResponse } from 'node-fetch';
import merge from 'deepmerge';
import { addDays, getUnixTime } from 'date-fns';
import querystring from 'querystring';
import crypto from 'crypto';
import { Logger } from 'winston';

import {
  getTokenByTeamId,
  updateToken,
  createToken,
  getConfigurationByTeamAndChannel,
  updateConfiguration,
  createConfiguration,
  deleteConfiguration,
} from './services';
import { SlackConfiguration } from './interfaces';
import { searchMenus } from '../menu/services';
import { MenuSearchParams, Menu } from '../menu/interfaces';
import { MenuItemComponentType } from '../menuItemComponent/interfaces';

export default (db: Knex, logger: Logger): Router => {
  const router = Router();

  const usageResponse = (): object => ({
    attachments: [
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Usage*\n
\`/lunch [today]\`\nGet today's lunch menus.\n\n
\`/lunch tomorrow\`\nGet tomorrow's lunch menus.\n\n
\`/lunch current-config\`\nGet current configuration.\n\n
\`/lunch config [restaurants] [coordinates] [limit] [language]\`\nConfigure LunchWatch for current channel.
• *restaurants*: Whitelist menus by restaurant ID. For example _restaurants:1,2,3_
• *coordinates*: Order menus by the distance to a location. For example _coordinates:65.0116512,25.4707493_
• *limit*: Limit the amount of menus returned. Defaults to 10. For example _limit:3_
• *language*: Language of the menus. Note: all menus are not available in every language. Defaults to fi. For example _language:en_\n\n
\`/lunch remove\`\nRemove LunchWatch from current channel.`,
            },
          },
        ],
      },
    ],
  });

  const notConfiguredResponse = (): object => ({
    attachments: [
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '_LunchWatch is not configured for this channel yet._',
            },
          },
        ],
      },
    ],
  });

  const currentConfigResponse = (config: SlackConfiguration): object => ({
    attachments: [
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `_Current configuration:_${
                config.restaurant_ids && config.restaurant_ids.length
                  ? ' restaurants:' + config.restaurant_ids
                  : ''
              }${
                config.lat && config.lng
                  ? ' coordinates:' + config.lat + ',' + config.lng
                  : ''
              }${config.limit ? ' limit:' + config.limit : ''}${
                config.language ? ' language:' + config.language : ''
              }`,
            },
          },
        ],
      },
    ],
  });

  const configSavedResponse = (): object => ({
    attachments: [
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*Configuration saved.*',
            },
          },
        ],
      },
    ],
  });

  const configRemovedResponse = (): object => ({
    attachments: [
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '_LunchWatch is now removed from this channel._',
            },
          },
        ],
      },
    ],
  });

  const somethingWentWrongResponse = (): object => ({
    attachments: [
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '_Something went wrong. Please try again._',
            },
          },
        ],
      },
    ],
  });

  const menusResponse = (menus: Menu[]): object => {
    const blocks = [];

    for (const menu of menus) {
      const restaurantName = menu.restaurant ? menu.restaurant.name : undefined;
      const restaurantChain = menu.restaurant
        ? menu.restaurant.chain
        : undefined;
      const restaurantUrl = menu.restaurant ? menu.restaurant.url : undefined;
      const menuItems =
        Array.isArray(menu.menu_items) && menu.menu_items.length
          ? menu.menu_items
          : undefined;

      if (restaurantName && menuItems) {
        const displayName = restaurantUrl
          ? `*<${restaurantUrl}|${
              restaurantChain ? restaurantChain + ' ' : ''
            }${restaurantName}>*`
          : `*${
              restaurantChain ? restaurantChain + ' ' : ''
            }${restaurantName}*`;

        const menuItemTexts: string[] = [];

        for (const menuItem of menuItems) {
          if (
            Array.isArray(menuItem.menu_item_components) &&
            menuItem.menu_item_components.length
          ) {
            for (const menuItemComponent of menuItem.menu_item_components) {
              if (menuItemComponent.value.length) {
                switch (menuItemComponent.type) {
                  case MenuItemComponentType.NAME:
                    menuItemTexts.push(`*${menuItemComponent.value}*`);
                    break;
                  case MenuItemComponentType.LUNCH_TIME:
                    menuItemTexts.push(`🕚 ${menuItemComponent.value}`);
                    break;
                  case MenuItemComponentType.PRICE_INFORMATION:
                    menuItemTexts.push(`🏷 ${menuItemComponent.value}`);
                    break;
                  case MenuItemComponentType.INFORMATION:
                    menuItemTexts.push(`ℹ️ ${menuItemComponent.value}`);
                    break;
                  default:
                    menuItemTexts.push(menuItemComponent.value);
                }
              }
            }

            menuItemTexts.push('');
          }
        }

        blocks.push(
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${displayName}\n${menuItemTexts.join('\n')}`,
            },
          },
          {
            type: 'divider',
          },
        );
      }
    }

    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'More results on <https://lunch.watch|LunchWatch>.',
        },
      ],
    });

    return {
      response_type: 'in_channel',
      attachments: [
        {
          blocks,
        },
      ],
    };
  };

  const handleUsage = async (res: Response): Promise<void> => {
    res.json(usageResponse());
  };

  const handleCurrentConfig = async (
    teamId: string,
    channelId: string,
    res: Response,
  ): Promise<void> => {
    const config = await getConfigurationByTeamAndChannel(
      db,
      teamId,
      channelId,
    );

    if (config) {
      res.json(currentConfigResponse(config));
    } else {
      res.json(notConfiguredResponse());
    }
  };

  const handleConfigure = async (
    teamId: string,
    channelId: string,
    text: string,
    res: Response,
  ): Promise<void> => {
    const settings: {
      restaurantIds?: number[];
      lat?: number;
      lng?: number;
      limit?: number;
      language?: string;
    } = {};

    const restaurantsMatches = text.match(/restaurants:([\d,]*)/);
    const coordinatesMatches = text.match(/coordinates:([\d.,]*)/);
    const limitMatches = text.match(/limit:([\d]*)/);
    const languageMatches = text.match(/language:([\w]*)/);

    if (Array.isArray(restaurantsMatches) && restaurantsMatches[1]) {
      const restaurantIds = restaurantsMatches[1]
        .split(',')
        .map((id) => parseInt(id, 10))
        .filter(
          (id, index, self) =>
            !Number.isNaN(id) && id > 0 && self.indexOf(id) === index,
        );

      if (Array.isArray(restaurantIds)) {
        settings.restaurantIds = restaurantIds;
      }
    }

    if (Array.isArray(coordinatesMatches) && coordinatesMatches[1]) {
      const [lat, lng] = coordinatesMatches[1].split(',').map(parseFloat);

      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        settings.lat = lat;
        settings.lng = lng;
      }
    }

    if (Array.isArray(limitMatches) && limitMatches[1]) {
      const limit = parseInt(limitMatches[1], 10);

      if (limit > 0) {
        settings.limit = limit;
      }
    }

    if (
      Array.isArray(languageMatches) &&
      languageMatches[1] &&
      (languageMatches[1] === 'fi' || languageMatches[1] === 'en')
    ) {
      settings.language = languageMatches[1];
    }

    if (
      (Array.isArray(settings.restaurantIds) &&
        settings.restaurantIds.length) ||
      (settings.lat && settings.lng) ||
      settings.limit ||
      settings.language
    ) {
      const existingConfiguration = await getConfigurationByTeamAndChannel(
        db,
        teamId,
        channelId,
      );

      if (existingConfiguration) {
        await updateConfiguration(
          db,
          existingConfiguration.id,
          teamId,
          channelId,
          settings.restaurantIds,
          settings.lat,
          settings.lng,
          settings.limit,
          settings.language,
        );
      } else {
        await createConfiguration(
          db,
          teamId,
          channelId,
          settings.restaurantIds,
          settings.lat,
          settings.lng,
          settings.limit,
          settings.language,
        );
      }

      const newConfiguration = await getConfigurationByTeamAndChannel(
        db,
        teamId,
        channelId,
      );

      if (newConfiguration) {
        res.json(
          merge.all([
            configSavedResponse(),
            currentConfigResponse(newConfiguration),
          ]),
        );
      } else {
        res.json(somethingWentWrongResponse());
      }

      return;
    }

    res.json(usageResponse());
  };

  const handleRemove = async (
    teamId: string,
    channelId: string,
    res: Response,
  ): Promise<void> => {
    const existingConfiguration = await getConfigurationByTeamAndChannel(
      db,
      teamId,
      channelId,
    );

    if (existingConfiguration) {
      const deleted = await deleteConfiguration(db, existingConfiguration.id);

      if (deleted) {
        res.json(configRemovedResponse());
      } else {
        res.json(somethingWentWrongResponse());
      }

      return;
    }

    res.json(notConfiguredResponse());
  };

  const defaultSearchParams: MenuSearchParams = {
    columns: ['menus.*'],
    conditions: {
      language: 'fi',
    },
    restaurantConditions: { enabled: true },
    order: 'restaurants.id ASC',
  };

  const parseSearchParams = (
    date: Date,
    restaurantIds?: string,
    lat?: number,
    lng?: number,
    language?: string,
  ): MenuSearchParams => {
    const params: MenuSearchParams = { ...defaultSearchParams };

    params.conditions = {
      ...params.conditions,
      date,
    };

    if (typeof restaurantIds === 'string' && restaurantIds.length) {
      const restaurantIdArray = restaurantIds
        .split(',')
        .map((id) => parseInt(id, 10))
        .filter(
          (id, index, self) =>
            !Number.isNaN(id) && id > 0 && self.indexOf(id) === index,
        );

      if (restaurantIdArray.length) {
        params.restaurant_ids = restaurantIdArray;
      }
    }

    if (typeof language === 'string' && language.length) {
      params.conditions = {
        ...params.conditions,
        language,
      };
    }

    if (typeof lat === 'number' && typeof lng === 'number') {
      const distanceColumn = db.raw(
        `((2 * 3961 * asin(sqrt((sin(radians((restaurants.lat - ${lat}) / 2))) ^ 2 + cos(radians(${lat})) * cos(radians(restaurants.lat)) * (sin(radians((restaurants.lng - ${lng}) / 2))) ^ 2))) * 1.60934) as distance`,
      );

      params.columns = [...params.columns, distanceColumn];
      params.order = 'distance ASC';
    }

    return params;
  };

  const handleMenusForDate = async (
    date: Date,
    teamId: string,
    channelId: string,
    res: Response,
  ): Promise<void> => {
    const config = await getConfigurationByTeamAndChannel(
      db,
      teamId,
      channelId,
    );

    if (config) {
      const params = parseSearchParams(
        date,
        config.restaurant_ids,
        config.lat,
        config.lng,
        config.language,
      );

      const menus = await searchMenus(
        db,
        params,
        config.limit || 10,
        0,
        true,
        true,
      );

      res.json(menusResponse(menus));
      return;
    }

    res.json(notConfiguredResponse());
  };

  const validateRequest = async (req: Request): Promise<boolean> => {
    const signatureHeader = req.header('X-Slack-Signature');
    const timestampHeader = parseInt(
      req.header('X-Slack-Request-Timestamp') || '',
      10,
    );
    const currentTimestamp = getUnixTime(new Date());

    // If the request timestamp is more than five minutes from local time
    // or signatureHeader or timestampHeader doesn't exist we return an error
    if (
      !signatureHeader ||
      !timestampHeader ||
      Math.abs(currentTimestamp - timestampHeader) > 60 * 5
    ) {
      await logger.error(
        `Invalid headers. Signature header: ${signatureHeader} Timestamp header: ${timestampHeader} Current timestamp: ${currentTimestamp}`,
        {
          service: 'Slack',
        },
      );

      return false;
    }

    const signatureBasestring =
      'v0:' + timestampHeader + ':' + querystring.stringify(req.body);

    const hash = crypto
      .createHmac('sha256', String(process.env.SLACK_SIGNING_SECRET))
      .update(signatureBasestring)
      .digest('hex');

    const signature = `v0=${hash}`;

    if (
      crypto.timingSafeEqual(
        Buffer.from(signatureHeader, 'utf8'),
        Buffer.from(signature, 'utf8'),
      )
    ) {
      return true;
    }

    await logger.error(
      `Invalid signature. Got: ${signatureHeader} Calculated: ${signature}`,
      {
        service: 'Slack',
      },
    );

    return false;
  };

  /**
   * GET /v1/slack
   */
  router.post(
    '/',
    async (req: Request, res: Response, next: Function): Promise<void> => {
      try {
        const {
          ssl_check: sslCheck,
          token,
          text,
          team_id: teamId,
          channel_id: channelId,
        } = req.body;

        // Respond to Slack's SSL verification
        if (String(sslCheck) === '1' && token.length) {
          res.status(200).send();
          return;
        }

        if (!validateRequest(req)) {
          res.json(somethingWentWrongResponse());
          return;
        }

        const t = typeof text === 'string' ? text.trim() : '';

        if (!t.length || t.substring(0, 5) === 'today') {
          await handleMenusForDate(new Date(), teamId, channelId, res);

          return;
        } else if (t.substring(0, 8) === 'tomorrow') {
          await handleMenusForDate(
            addDays(new Date(), 1),
            teamId,
            channelId,
            res,
          );

          return;
        } else if (t.substring(0, 14) === 'current-config') {
          await handleCurrentConfig(teamId, channelId, res);
          return;
        } else if (t.substring(0, 6) === 'config') {
          await handleConfigure(teamId, channelId, t, res);
          return;
        } else if (t.substring(0, 6) === 'remove') {
          await handleRemove(teamId, channelId, res);
          return;
        }

        await handleUsage(res);
      } catch (err) {
        next(err);
      }
    },
  );

  /**
   * GET /v1/slack/auth
   */
  router.get(
    '/auth',
    async (req: Request, res: Response, next: Function): Promise<void> => {
      try {
        const { code } = req.query;

        if (!code) {
          throw Boom.badRequest('Code missing');
        }

        await fetch(
          `https://slack.com/api/oauth.access?code=${code}&client_id=${process.env.SLACK_CLIENT_ID}&client_secret=${process.env.SLACK_CLIENT_SECRET}&redirect_uri=${process.env.SLACK_REDIRECT_URI}`,
        )
          .then(
            async (response: FetchResponse): Promise<void> => {
              const responseObject = await response.json();

              if (!responseObject.ok) {
                throw new Error();
              }

              const {
                access_token: accessToken,
                scope,
                team_name: teamName,
                team_id: teamId,
              } = responseObject;

              const existingToken = await getTokenByTeamId(db, teamId);

              if (existingToken) {
                await updateToken(
                  db,
                  existingToken.id,
                  accessToken,
                  scope,
                  teamName,
                  teamId,
                );
              } else {
                await createToken(db, accessToken, scope, teamName, teamId);
              }
            },
          )
          .catch(() => {
            throw Boom.badImplementation('Unexpected error');
          });

        res.redirect(String(process.env.APP_FRONTEND_URL));
      } catch (err) {
        next(err);
      }
    },
  );

  /**
   * GET /v1/slack/install
   */
  router.get(
    '/install',
    async (req: Request, res: Response, next: Function): Promise<void> => {
      try {
        res.redirect(
          `https://slack.com/oauth/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=commands`,
        );
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};
