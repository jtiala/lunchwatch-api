import { Router } from 'express';
import HttpStatus from 'http-status-codes';
import * as restaurantService from '../services/restaurantService';
import { findRestaurant, restaurantValidator } from '../validators/restaurantValidator';

const router = Router();

/**
 * GET /v1/restaurants
 */
router.get('/', (req, res, next) => {
  restaurantService
    .getAllRestaurants()
    .then(data => res.json({ data }))
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

/**
 * POST /v1/restaurants
 */
router.post('/', restaurantValidator, (req, res, next) => {
  restaurantService
    .createRestaurant(req.body)
    .then(data => res.status(HttpStatus.CREATED).json({ data }))
    .catch(err => next(err));
});

/**
 * PUT /v1/restaurants/:id
 */
router.put('/:id', findRestaurant, restaurantValidator, (req, res, next) => {
  restaurantService
    .updateRestaurant(req.params.id, req.body)
    .then(data => res.json({ data }))
    .catch(err => next(err));
});

/**
 * DELETE /v1/restaurants/:id
 */
router.delete('/:id', findRestaurant, (req, res, next) => {
  restaurantService
    .deleteRestaurant(req.params.id)
    .then(data => res.status(HttpStatus.NO_CONTENT).json({ data }))
    .catch(err => next(err));
});

export default router;
