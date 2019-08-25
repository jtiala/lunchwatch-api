import 'dotenv/config';

import { ApolloServer, IResolvers } from 'apollo-server-express';
import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import Knex from 'knex';
import PQueue from 'p-queue';
import morgan from 'morgan';
import { Logger } from 'winston';
import nodeSchedule from 'node-schedule';
import Boom from '@hapi/boom';
import merge from 'deepmerge';

import { description, version } from '../package.json';
import databaseConfig from './database/config';
import { createLogger, createLogDir } from './utils/logger';
import { Context, rootTypeDefs, rootResolvers } from './utils/graphql';

import restaurantsController from './restaurant/controller';
import menusController from './menu/controller';

import restaurantTypeDefs from './restaurant/typeDefs';
import menuTypeDefs from './menu/typeDefs';
import menuItemTypeDefs from './menuItem/typeDefs';
import menuItemComponentTypeDefs from './menuItemComponent/typeDefs';
import importDetailsTypeDefs from './importDetails/typeDefs';

import restaurantResolvers from './restaurant/resolvers';
import menuResolvers from './menu/resolvers';
import menuItemResolvers from './menuItem/resolvers';
import menuItemComponentResolvers from './menuItemComponent/resolvers';
import importDetailsResolvers from './importDetails/resolvers';

import { ImportDetails } from './importDetails/interfaces';

import {
  getEnabledImportDetails,
  getSchedules,
} from './importDetails/services';
import { deleteMenusOlderThan } from './menu/services';

import AbstractImporter from './importers/AbstractImporter';
import AmicaImporter from './importers/AmicaImporter';
import FazerFoodCoImporter from './importers/FazerFoodCoImporter';
import SodexoImporter from './importers/SodexoImporter';
import UnirestaImporter from './importers/UnirestaImporter';
import JuvenesImporter from './importers/JuvenesImporter';
import LaTorrefazioneImporter from './importers/LaTorrefazioneImporter';
import AaltoCateringImporter from './importers/AaltoCateringImporter';
import PitopalveluTimonenImporter from './importers/PitopalveluTimonenImporter';

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
      resolvers: merge.all<IResolvers>([
        rootResolvers,
        restaurantResolvers,
        menuResolvers,
        menuItemResolvers,
        menuItemResolvers,
        menuItemComponentResolvers,
        importDetailsResolvers,
      ]),
      context: (): Context => ({ db: this.db }),
      introspection: true,
      playground: true,
    });

    this.configureApp();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
    this.applyApolloServerMiddleware();

    if (process.env.NODE_ENV === 'development') {
      this.addImportersToQueue();
    }

    if (process.env.NODE_ENV === 'production') {
      this.addImportersToQueue();
      this.scheduleImporters();
      this.scheduleCleaner();
    }
  }

  private configureApp(): void {
    this.app.locals.title = description;
    this.app.locals.version = version;

    this.app.set('host', process.env.APP_HOST || '0.0.0.0');
    this.app.set('port', process.env.APP_PORT || '3000');

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
      case 'JuvenesImporter':
        return new JuvenesImporter(importDetails, db, queue, logger);
      case 'LaTorrefazioneImporter':
        return new LaTorrefazioneImporter(importDetails, db, queue, logger);
      case 'AaltoCateringImporter':
        return new AaltoCateringImporter(importDetails, db, queue, logger);
      case 'PitopalveluTimonenImporter':
        return new PitopalveluTimonenImporter(importDetails, db, queue, logger);
      default:
        this.logger.error(
          `Invalid importer type: ${importDetails.importer_type}`,
        );
    }
  }

  private async addImportersToQueue(schedule?: string): Promise<void> {
    const enabledImportDetails = await getEnabledImportDetails(
      this.db,
      schedule,
    );

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
    const schedules = await getSchedules(this.db);

    for (const { schedule } of schedules) {
      const crons = schedule.split(';');

      for (const cron of crons) {
        await nodeSchedule.scheduleJob(
          cron,
          async (): Promise<void> => await this.addImportersToQueue(schedule),
        );
      }
    }
  }

  private async scheduleCleaner(): Promise<void> {
    await nodeSchedule.scheduleJob(
      this.app.get('cronDBCleaner'),
      async (): Promise<void> => {
        const deletedMenusCount = await deleteMenusOlderThan(this.db, 4);

        await this.logger.info(`Deleted ${deletedMenusCount} menus`, {
          service: 'Cleaner',
        });
      },
    );
  }

  public getBuild(): string {
    if (typeof process.env.APP_BUILD === 'string') {
      return process.env.APP_BUILD;
    }

    return String(process.env.NODE_ENV);
  }

  public listen(): void {
    this.app.listen(this.app.get('port'), this.app.get('host'), (): void => {
      this.logger.info(
        `Started build ${this.getBuild()} at http://${this.app.get(
          'host',
        )}:${this.app.get('port')}`,
      );
    });
  }
}
