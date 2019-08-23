import { format } from 'date-fns';

import AmicaImporter from './AmicaImporter';

export default class FazerFoodCoImporter extends AmicaImporter {
  public name = 'FazerFoodCoImporter';

  protected getUrl(identifier: string, language: string, date: Date): string {
    return `https://www.fazerfoodco.fi/modules/json/json/Index?costNumber=${identifier}&language=${language}&firstDay=${format(
      date,
      'yyyy-MM-dd',
    )}`;
  }
}
