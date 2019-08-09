const stringToCamel = (originalString: string): string => {
  return originalString.replace(
    /([-_][a-z])/gi,
    (newString: string): string => {
      return newString
        .toUpperCase()
        .replace('-', '')
        .replace('_', '');
    },
  );
};

// FIXME: anything but any
/* eslint-disable @typescript-eslint/no-explicit-any */
const keysToCamel = (obj: any): any => {
  if (obj instanceof Date) {
    return obj;
  } else if (Array.isArray(obj)) {
    return obj.map((i: any): any => {
      return keysToCamel(i);
    });
  } else if (typeof obj === 'object' && obj !== null) {
    const newObj: any = {};

    Object.keys(obj).forEach((key: any): void => {
      newObj[stringToCamel(key)] = keysToCamel(obj[key]);
    });

    return newObj;
  }

  return obj;
};

/**
 * Normalizes data from the database.
 * Currently only transform snake_case keys to camelCase.
 *
 * @param {(Array|Object)} data - Data fetched from the database
 * @returns {(Array|Object)} Normalized data
 */
export function normalizeDatabaseData(data: any[]): any[];
export function normalizeDatabaseData(data: object): object;
export function normalizeDatabaseData(data: any[] | object): any[] | object {
  return keysToCamel(data);
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Normalizes parts of menus imported from various sources.
 *
 * @param {string} string - Original string
 * @returns {string} Normalized string
 */
export const normalizeImportedString = (string: string): string =>
  string
    // \r\n => \n
    .replace(/ *(?:\\[rn]|[\r\n]+)+ */g, '\n')

    // 10.00-11.00 => 10:00-11:00, doesn't affect dates
    .replace(/(?<=[0-2][0-9]|[0-2])\.(?=[0-5][0-9][$-]|[0-5][0-9]\s)/g, ':')

    // 10:00-11:00 => 10:00 - 11:00
    .replace(/(?<=\d)-(?=\d)/g, ' - ')

    // 10,00 € => 10.00 €
    .replace(/(?<=\d),(?=\d)/g, '.')

    // 10.00 € => 10.00€
    .replace(/ €/g, '€')

    // 10€/20€ => 10€ /20€
    // kcal/100g => kcal /100g
    .replace(/(?<=\S)\//g, ' /')

    // 10€ /20€ => 10€ / 20€
    // kcal /100g => kcal / 100g
    .replace(/\/(?<=\S)/g, '/ ')

    // G ,L ,Veg => G, L, Veg
    .replace(/ ,/g, ', ')

    // G,L,Veg => G, L, Veg
    .replace(/,[s]*/g, ', ')

    // VEG([S]) => VEG ([S])
    .replace(/(?<=\w*)\(/g, ' (')

    // Remove trailing dots, commas, colons and whitespace
    .replace(/[\.\,\:\s]+$/, '')

    // Replace all double+ spaces with one space
    .replace(/ ( )+/g, ' ')

    // Trim whitespace
    .trim();
