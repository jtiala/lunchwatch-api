import Knex from 'knex';
import PQueue from 'p-queue';
import { Logger } from 'winston';
import differenceInMilliseconds from 'date-fns/difference_in_milliseconds';

import { MenuItemType } from '../menuItem/interfaces';
import { ImportDetails } from '../importDetails/interfaces';
import { updateLastImportAt } from '../importDetails/services';

export default abstract class AbstractImporter {
  protected importDetails: ImportDetails;
  protected db: Knex;
  protected queue: PQueue;
  protected logger: Logger;

  abstract run(): Promise<void>;

  public constructor(
    importDetails: ImportDetails,
    db: Knex,
    queue: PQueue,
    logger: Logger,
  ) {
    this.importDetails = importDetails;
    this.db = db;
    this.queue = queue;
    this.logger = logger;
  }

  protected getLogService(): string {
    return `${this.constructor.name}/${this.importDetails.identifier}/${this.importDetails.language}`;
  }

  protected async logStart(): Promise<Date> {
    await this.logger.info('Started', {
      service: this.getLogService(),
    });

    return new Date();
  }

  protected async logEnd(startDate: Date): Promise<void> {
    const endDate = new Date();

    await this.logger.info(
      `Finished in ${Math.round(
        differenceInMilliseconds(endDate, startDate) / 100,
      ) / 10} seconds`,
      {
        service: this.getLogService(),
      },
    );
  }

  public addToQueue(): void {
    this.logger.info('Queued', {
      service: this.getLogService(),
    });

    this.queue.add(
      async (): Promise<void> => {
        try {
          const startDate: Date = await this.logStart();

          await this.run();
          await updateLastImportAt(this.db, this.importDetails.id);
          await this.logEnd(startDate);
        } catch (error) {
          await this.logger.error(error, {
            service: this.getLogService(),
          });
        }
      },
    );
  }

  protected static getMenuItemTypeFromString(
    string: string,
    defaultType: string = MenuItemType.NORMAL_MEAL,
    skipTypes: string[] = [],
  ): string {
    if (
      skipTypes.indexOf(MenuItemType.VEGETARIAN_MEAL) < 0 &&
      ['kasvi', 'vege', 'vegaani', 'vegan'].findIndex((v: string): boolean =>
        string.toLowerCase().includes(v),
      ) > -1
    ) {
      return MenuItemType.VEGETARIAN_MEAL;
    }

    if (
      skipTypes.indexOf(MenuItemType.LIGHT_MEAL) < 0 &&
      ['kevyt', 'keitto', 'light', 'soup', 'salaatti', 'salad'].findIndex(
        (v: string): boolean => string.toLowerCase().includes(v),
      ) > -1
    ) {
      return MenuItemType.LIGHT_MEAL;
    }

    if (
      skipTypes.indexOf(MenuItemType.SPECIAL_MEAL) < 0 &&
      ['grill', 'erikois', 'pizza', 'herkku', 'portion', 'special'].findIndex(
        (v: string): boolean => string.toLowerCase().includes(v),
      ) > -1
    ) {
      return MenuItemType.SPECIAL_MEAL;
    }

    if (
      skipTypes.indexOf(MenuItemType.DESSERT) < 0 &&
      ['jälki', 'jälkkäri', 'dessert', 'sweet'].findIndex(
        (v: string): boolean => string.toLowerCase().includes(v),
      ) > -1
    ) {
      return MenuItemType.DESSERT;
    }

    if (
      skipTypes.indexOf(MenuItemType.BREAKFAST) < 0 &&
      ['aamu', 'aamiai', 'breakfast', 'morning'].findIndex(
        (v: string): boolean => string.toLowerCase().includes(v),
      ) > -1
    ) {
      return MenuItemType.BREAKFAST;
    }

    if (
      skipTypes.indexOf(MenuItemType.LUNCH_TIME) < 0 &&
      ['klo', 'kello', 'avoinna', 'open'].findIndex((v: string): boolean =>
        string.toLowerCase().includes(v),
      ) > -1
    ) {
      return MenuItemType.LUNCH_TIME;
    }

    return defaultType;
  }
}
