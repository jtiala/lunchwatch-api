import 'dotenv/config';

import { ApolloServer } from 'apollo-server-express';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import Knex from 'knex';
import PQueue from 'p-queue';
import morgan from 'morgan';
import { Logger } from 'winston';
import schedule from 'node-schedule';
import Boom from '@hapi/boom';
import { merge } from 'lodash';

import { description, version } from '../package.json';
import databaseConfig from './database/config';
import restaurantsController from './controllers/restaurants';
import menusController from './controllers/menus';
import { restaurantTypeDefs, restaurantResolvers } from './models/restaurant';
import {
  deleteMenusOlderThan,
  menuTypeDefs,
  menuResolvers,
} from './models/menu';
import { menuItemTypeDefs, menuItemResolvers } from './models/menuItem';
import {
  menuItemComponentTypeDefs,
  menuItemComponentResolvers,
} from './models/menuItemComponent';
import {
  ImportDetails,
  getEnabledImportDetails,
  importDetailsTypeDefs,
  importDetailsResolvers,
} from './models/importDetails';
import { createLogger, createLogDir } from './utils/logger';
import { Context, rootTypeDefs, rootResolvers } from './utils/graphql';
import AbstractImporter from './importers/AbstractImporter';
import AmicaImporter from './importers/AmicaImporter';
import FazerFoodCoImporter from './importers/FazerFoodCoImporter';
import SodexoImporter from './importers/SodexoImporter';
import UnirestaImporter from './importers/UnirestaImporter';

export default class App {
  public apolloServer: ApolloServer;
  public app: express.Application;
  public db: Knex;
  public logger: Logger;
  public queue: PQueue;

  public constructor() {
    this.app = express();
    this.db = Knex(databaseConfig);
    this.logger = createLogger();
    this.queue = new PQueue({
      concurrency: 1,
      autoStart: true,
      intervalCap: 1,
      interval: 1000,
    });
    this.apolloServer = new ApolloServer({
      typeDefs: [
        rootTypeDefs,
        restaurantTypeDefs,
        menuTypeDefs,
        menuItemTypeDefs,
        menuItemComponentTypeDefs,
        importDetailsTypeDefs,
      ],
      resolvers: merge([
        rootResolvers,
        restaurantResolvers,
        menuResolvers,
        menuItemResolvers,
        menuItemResolvers,
        menuItemComponentResolvers,
        importDetailsResolvers,
      ]),
      context: (): Context => ({ db: this.db }),
    });

    this.configureApp();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
    this.applyApolloServerMiddleware();

    if (process.env.NODE_ENV !== 'test') {
      this.scheduleImporters();
      this.scheduleCleaner();
    }
  }

  private configureApp(): void {
    this.app.locals.title = description;
    this.app.locals.version = version;

    this.app.set('host', process.env.APP_HOST || '0.0.0.0');
    this.app.set('port', process.env.APP_PORT || '3000');

    this.app.set(
      'cronImportMenus',
      process.env.CRON_IMPORT_MENUS || '0 4 * * *',
    );
    this.app.set('cronDBCleaner', process.env.CRON_DB_CLEANER || '0 3 * * 1');

    createLogDir();
  }

  private configureMiddleware(): void {
    this.app.use(cors());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(morgan('dev'));
  }

  private configureErrorHandling(): void {
    this.app.use(
      (
        err: Error | Boom,
        req: Request,
        res: Response,
        next: Function,
      ): void => {
        if (err instanceof Boom) {
          res.status(err.output.statusCode).json({
            code: err.output.statusCode,
            message: err.output.payload.message || err.output.payload.error,
          });
        }

        res.status(500).json({
          error: {
            code: 500,
            message: 'Internal Server Error',
          },
        });

        next();
      },
    );
  }

  private configureRoutes(): void {
    this.app.get(
      '/',
      async (req: Request, res: Response): Promise<void> => {
        await res.json({
          app: req.app.locals.title,
          version: req.app.locals.version,
        });
      },
    );

    this.app.get('/v1', (req: Request, res: Response): void => {
      res.redirect('/');
    });

    this.app.use('/v1/restaurants', restaurantsController(this.db));
    this.app.use('/v1/menus', menusController(this.db));
  }

  private applyApolloServerMiddleware(): void {
    this.apolloServer.applyMiddleware({ app: this.app });
  }

  private getImporter(
    importDetails: ImportDetails,
    db: Knex,
    queue: PQueue,
    logger: Logger,
  ): AbstractImporter | undefined {
    switch (importDetails.importer_type) {
      case 'AmicaImporter':
        return new AmicaImporter(importDetails, db, queue, logger);
      case 'FazerFoodCoImporter':
        return new FazerFoodCoImporter(importDetails, db, queue, logger);
      case 'SodexoImporter':
        return new SodexoImporter(importDetails, db, queue, logger);
      case 'UnirestaImporter':
        return new UnirestaImporter(importDetails, db, queue, logger);
      default:
        this.logger.error(
          `Invalid importer type: ${importDetails.importer_type}`,
        );
    }
  }

  private async addImportersToQueue(): Promise<void> {
    const enabledImportDetails = await getEnabledImportDetails(this.db);

    for (const importDetails of enabledImportDetails) {
      const importer = this.getImporter(
        importDetails,
        this.db,
        this.queue,
        this.logger,
      );

      if (importer) {
        importer.addToQueue();
      }
    }
  }

  private async scheduleImporters(): Promise<void> {
    await schedule.scheduleJob(
      this.app.get('cronImportMenus'),
      async (): Promise<void> => await this.addImportersToQueue(),
    );
  }

  private async scheduleCleaner(): Promise<void> {
    await schedule.scheduleJob(
      this.app.get('cronDBCleaner'),
      async (): Promise<void> => {
        const deletedMenusCount = await deleteMenusOlderThan(this.db, 4);

        await this.logger.info(`Deleted ${deletedMenusCount} menus`, {
          service: 'Cleaner',
        });
      },
    );
  }

  public listen(): void {
    this.app.listen(this.app.get('port'), this.app.get('host'), (): void => {
      this.logger.info(
        `Started at http://${this.app.get('host')}:${this.app.get('port')}`,
      );
    });
  }
}
