import { Router } from 'express';
import swaggerSpec from './utils/swagger';
import restaurantsController from './controllers/restaurants';

/**
 * Contains all API routes for the application.
 */
const router = Router();

/**
 * GET /api/swagger.json
 */
router.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

router.get('/', (req, res) => {
  res.json({
    app: req.app.locals.title,
    apiVersion: req.app.locals.version,
  });
});

router.use('/restaurants', restaurantsController);

export default router;
