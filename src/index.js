import 'babel-polyfill';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import express from 'express';
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import compression from 'compression';
import Queue from 'p-queue';
import './env';
import './db';
import routes from './routes';
import logger from './utils/logger';
import scheduler from './utils/scheduler';
import json from './middlewares/json';
import * as errorHandler from './middlewares/errorHandler';

const queue = new Queue({
  concurrency: 1,
  autoStart: true,
});

const app = express();
const APP_PORT = process.env.APP_PORT || '3000';
const APP_HOST = process.env.APP_HOST || '0.0.0.0';

app.set('port', APP_PORT);
app.set('host', APP_HOST);

app.locals.title = process.env.APP_NAME;
app.locals.version = process.env.APP_VERSION;

app.use(favicon(path.join(__dirname, '/../public', 'favicon.ico')));
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(errorHandler.bodyParser);
app.use(json);

// Everything in the public folder is served as static content
app.use(express.static(path.join(__dirname, '/../public')));

// API Routes
app.use('/', routes);

// Error Middlewares
app.use(errorHandler.genericErrorHandler);
app.use(errorHandler.methodNotAllowed);

app.listen(app.get('port'), app.get('host'), () => {
  logger.log('info', `Server started at http://${app.get('host')}:${app.get('port')}`);

  if (process.env.NODE_ENV !== 'test') {
    scheduler.scheduleDatabaseCleaner(queue, process.env.DB_CLEANER_CRON);
    scheduler.scheduleImporters(queue, process.env.IMPORT_MENUS_CRON);
  }
});

export default app;
