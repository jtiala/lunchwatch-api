import { Router, Request, Response } from 'express';
import { ParsedUrlQuery } from 'querystring';
import Knex from 'knex';
import Boom from '@hapi/boom';

import {
  getMenu,
  MenuSearchParams,
  defaultSearchParams,
  countMenus,
  searchMenus,
} from '../models/menu';
import { generatePagination } from '../utils/pagination';
import { normalizeDatabaseData } from '../utils/normalize';

const menusController = (db: Knex): Router => {
  const router = Router();

  const parseSearchParamsFromQuery = (
    query: ParsedUrlQuery,
  ): MenuSearchParams => {
    const params: MenuSearchParams = { ...defaultSearchParams };

    // Menu conditions
    if (typeof query.restaurantId === 'string' && query.restaurantId.length) {
      params.conditions = {
        ...params.conditions,
        restaurant_id: parseInt(query.restaurantId, 10),
      };
    }

    if (typeof query.date === 'string' && query.date.length) {
      params.conditions = { ...params.conditions, date: String(query.date) };
    }

    if (typeof query.language === 'string' && query.language.length) {
      params.conditions = {
        ...params.conditions,
        language: String(query.language),
      };
    }

    // Restaurant conditions
    if (typeof query.enabled === 'string' && query.enabled.length) {
      params.restaurantConditions = {
        ...params.restaurantConditions,
        enabled: query.enabled === 'true',
      };
    }

    if (typeof query.chain === 'string' && query.chain.length) {
      params.restaurantConditions = {
        ...params.restaurantConditions,
        chain: String(query.chain),
      };
    }

    if (
      typeof query.lat === 'string' &&
      query.lat.length &&
      typeof query.lng === 'string' &&
      query.lng.length
    ) {
      const parsedLat = parseFloat(query.lat);
      const parsedLng = parseFloat(query.lng);

      const distanceColumn = db.raw(
        `((2 * 3961 * asin(sqrt((sin(radians((restaurants.lat - ${parsedLat}) / 2))) ^ 2 + cos(radians(${parsedLat})) * cos(radians(restaurants.lat)) * (sin(radians((restaurants.lng - ${parsedLng}) / 2))) ^ 2))) * 1.60934) as distance`,
      );

      params.columns = [...params.columns, distanceColumn];
      params.order = 'distance ASC';
    }

    return params;
  };

  /**
   * GET /v1/menus/:id
   */
  router.get(
    '/:id',
    async (req: Request, res: Response, next: Function): Promise<void> => {
      try {
        const id = parseInt(req.params.id, 10);

        if (!id) {
          throw Boom.badRequest('Invalid ID');
        }

        const menu = await getMenu(db, id, true, true);

        if (menu && menu.id) {
          res.json({
            data: normalizeDatabaseData(menu),
          });
        } else {
          throw Boom.notFound('Menu not found');
        }
      } catch (err) {
        next(err);
      }
    },
  );

  /**
   * GET /v1/menus
   */
  router.get(
    '/',
    async (req: Request, res: Response, next: Function): Promise<void> => {
      try {
        const searchParams = parseSearchParamsFromQuery(req.query);
        const count = await countMenus(db, searchParams);

        if (count) {
          const [pagination, limit, offset] = generatePagination(
            count,
            req.query,
          );

          res.json({
            data: normalizeDatabaseData(
              await searchMenus(db, searchParams, limit, offset, true, true),
            ),
            pagination,
          });
        } else {
          throw Boom.notFound('No menus found');
        }
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};

export default menusController;
