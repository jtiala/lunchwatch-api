import { Router } from 'express';
import * as menuService from '../services/menuService';

const router = Router();

/**
 * GET /v1/menus
 */
router.get('/', (req, res, next) => {
  menuService
    .searchMenus(req.query)
    .then(data => res.json({ data }))
    .catch(err => next(err));
});

/**
 * GET /v1/menus/:id
 */
router.get('/:id', (req, res, next) => {
  menuService
    .getMenu(req.params.id)
    .then(data => res.json({ data }))
    .catch(err => next(err));
});

export default router;
