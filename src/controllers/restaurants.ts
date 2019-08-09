import { Router, Request, Response } from 'express';
import { ParsedUrlQuery } from 'querystring';
import Knex from 'knex';
import Boom from '@hapi/boom';

import {
  getRestaurant,
  searchRestaurants,
  RestaurantSearchParams,
  defaultSearchParams,
  countRestaurants,
} from '../models/restaurant';
import { generatePagination } from '../utils/pagination';
import { normalizeDatabaseData } from '../utils/normalize';

const restaurantsController = (db: Knex): Router => {
  const router = Router();

  const parseSearchParamsFromQuery = (
    query: ParsedUrlQuery,
  ): RestaurantSearchParams => {
    const params: RestaurantSearchParams = { ...defaultSearchParams };

    if (typeof query.enabled === 'string' && query.enabled.length) {
      params.conditions = {
        ...params.conditions,
        enabled: query.enabled === 'true',
      };
    }

    if (typeof query.chain === 'string' && query.chain.length) {
      params.conditions = {
        ...params.conditions,
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
   * GET /v1/restaurants
   */
  router.get(
    '/',
    async (req: Request, res: Response, next: Function): Promise<void> => {
      try {
        const searchParams = parseSearchParamsFromQuery(req.query);
        const count = await countRestaurants(db, searchParams);

        if (count) {
          const [pagination, limit, offset] = generatePagination(
            count,
            req.query,
          );

          res.json({
            data: normalizeDatabaseData(
              await searchRestaurants(db, searchParams, limit, offset),
            ),
            pagination,
          });
        } else {
          throw Boom.notFound('No restaurants found');
        }
      } catch (err) {
        next(err);
      }
    },
  );

  /**
   * GET /v1/restaurants/:id
   */
  router.get(
    '/:id',
    async (req: Request, res: Response, next: Function): Promise<void> => {
      try {
        const id = parseInt(req.params.id, 10);

        if (!id) {
          throw Boom.badRequest('Invalid ID');
        }

        const restaurant = await getRestaurant(db, id);

        if (restaurant && restaurant.id) {
          res.json({
            data: normalizeDatabaseData(restaurant),
          });
        } else {
          throw Boom.notFound('Restaurant not found');
        }
      } catch (err) {
        next(err);
      }
    },
  );

  return router;
};

export default restaurantsController;
