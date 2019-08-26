import Knex from 'knex';
import PQueue from 'p-queue';
import { Logger } from 'winston';

import { ImportDetails } from './interfaces';

import AbstractImporter from '../importers/AbstractImporter';
import AmicaImporter from '../importers/AmicaImporter';
import FazerFoodCoImporter from '../importers/FazerFoodCoImporter';
import SodexoImporter from '../importers/SodexoImporter';
import UnirestaImporter from '../importers/UnirestaImporter';
import JuvenesImporter from '../importers/JuvenesImporter';
import LaTorrefazioneImporter from '../importers/LaTorrefazioneImporter';
import AaltoCateringImporter from '../importers/AaltoCateringImporter';
import PitopalveluTimonenImporter from '../importers/PitopalveluTimonenImporter';
import RaflaamoImporter from '../importers/RaflaamoImporter';

export const getImporter = (
  importDetails: ImportDetails,
  db: Knex,
  queue: PQueue,
  logger: Logger,
): AbstractImporter | undefined => {
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
    case 'RaflaamoImporter':
      return new RaflaamoImporter(importDetails, db, queue, logger);
    default:
      logger.error(`Invalid importer type: ${importDetails.importer_type}`);
  }
};
