import { Router } from 'express';
import * as restaurantService from '../services/restaurantService';

const router = Router();

/**
 * GET /v1/restaurants
 */
router.get('/', (req, res, next) => {
  restaurantService
    .searchRestaurants(req.query)
    .then(data => res.json({ data, pagination: data.pagination }))
    .catch(err => next(err));
});

/**
 * GET /v1/restaurants/:id
 */
router.get('/:id', (req, res, next) => {
  restaurantService
    .getRestaurant(req.params.id)
    .then(data => res.json({ data }))
    .catch(err => next(err));
});

export default router;
