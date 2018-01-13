import { Router } from 'express';
import swaggerSpec from './utils/swagger';
import restaurantsController from './controllers/restaurants';

/**
 * Contains all API routes for the application.
 */
const router = Router();

/**
 * GET /
 */
router.get('/', (req, res) => {
  res.redirect('/v1');
});

/**
 * GET /v1/swagger.json
 */
router.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

router.get('/v1', (req, res) => {
  res.json({
    app: req.app.locals.title,
    version: req.app.locals.version,
  });
});

router.use('/v1/restaurants', restaurantsController);

export default router;
