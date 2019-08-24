import puppeteer, { Browser } from 'puppeteer-core';

import AbstractImporter from './AbstractImporter';

export default abstract class AbstractPuppeteerImporter extends AbstractImporter {
  public async getBrowser(): Promise<Browser> {
    return await puppeteer.connect({
      browserWSEndpoint: process.env.CHROME_WS_ENDPOINT,
    });
  }
}
