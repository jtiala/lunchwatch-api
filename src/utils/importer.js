import differenceInSeconds from 'date-fns/difference_in_seconds';
import logger from '../utils/logger';
import amicaImporter from '../importers/amicaImporter';
import unirestaImporter from '../importers/unirestaImporter';

const importers = {
  amicaImporter,
  unirestaImporter,
};

export const importer = (importerName, identifier, restaurantId, language) =>
  importers[importerName](identifier, restaurantId, language);

export const start = (importerName, identifier, language) =>
  new Promise((resolve) => {
    logger.log('info', `Starting ${importerName}/${identifier}/${language}`);
    resolve();
  });

export const end = (startDate, importerName, identifier, language) =>
  new Promise((resolve) => {
    logger.log('info', `Finished ${importerName}/${identifier}/${language} in ${differenceInSeconds(Date(), startDate)} seconds`);
    resolve();
  });

export const normalizeString = (string) => {
  let str = string;

  if ((typeof str !== 'string') && (typeof str !== 'undefined')
    && str !== null && (typeof str.toString === 'function')) {
    str = str.toString();
  }

  // \r\n => \n
  str = str.replace(/ *(?:\\[rn]|[\r\n]+)+ */g, '\n');

  // G ,L ,Veg => G, L, Veg
  str = str.replace(/ ,/g, ', ');

  // G,L,Veg => G, L, Veg
  str = str.replace(/,[s]*/g, ', ');

  // VEG([S]) => VEG ([S])
  str = str.replace(/(?<=\w*)\(/g, ' (');

  // 10.00-11.00 => 10:00-11:00, doesn't affect dates
  str = str.replace(/(?<=[0-2][0-9]|[0-2])\.(?=[0-5][0-9][$-]|[0-5][0-9]\s)/g, ':');

  // 10:00-11:00 => 10:00 - 11:00
  str = str.replace(/(?<=\d)-(?=\d)/g, ' - ');

  // 10,00 € => 10.00 €
  str = str.replace(/(?<=\d),(?=\d)/g, '.');

  // 10.00 € => 10.00€
  str = str.replace(/ €/g, '€');

  // 10€/20€ => 10€ /20€
  // kcal/100g => kcal /100g
  str = str.replace(/(?<=\S)\//g, ' /');

  // 10€ /20€ => 10€ / 20€
  // kcal /100g => kcal / 100g
  str = str.replace(/\/(?<=\S)/g, '/ ');

  // Replace all double+ spaces with one space
  str = str.replace(/ ( )+/g, ' ');

  // Trim whitespace
  str = str.trim();

  return str;
};

export const getMenuItemTypeFromString = (string, defaultType = 'normal_meal', skipTypes = []) => {
  let str = string;

  if ((typeof str !== 'string') && (typeof str !== 'undefined')
    && str !== null && (typeof str.toString === 'function')) {
    str = str.toString();
  }

  if (typeof str !== 'string') {
    return defaultType;
  }

  if (skipTypes.indexOf('vegetarian_meal') < 0 && [
    'kasvi',
    'vege',
    'salaatti',
    'salad',
  ].findIndex(v => str.toLowerCase().includes(v)) > -1) {
    return 'vegetarian_meal';
  } else if (skipTypes.indexOf('light_meal') < 0 && [
    'kevyt',
    'keitto',
    'light',
    'soup',
  ].findIndex(v => str.toLowerCase().includes(v)) > -1) {
    return 'light_meal';
  } else if (skipTypes.indexOf('special_meal') < 0 && [
    'grill',
    'erikois',
    'pitsa',
    'pizza',
    'bizza',
    'herkku',
    'portion',
    'special',
  ].findIndex(v => str.toLowerCase().includes(v)) > -1) {
    return 'special_meal';
  } else if (skipTypes.indexOf('dessert') < 0 && [
    'jälki',
    'jälkkäri',
    'dessert',
  ].findIndex(v => str.toLowerCase().includes(v)) > -1) {
    return 'dessert';
  } else if (skipTypes.indexOf('breakfast') < 0 && [
    'aamu',
    'aamiai',
    'breakfast',
    'morning',
  ].findIndex(v => str.toLowerCase().includes(v)) > -1) {
    return 'breakfast';
  } else if (skipTypes.indexOf('lunch_time') < 0 && [
    'klo',
    'kello',
    'avoinna',
    'open',
  ].findIndex(v => str.toLowerCase().includes(v)) > -1) {
    return 'lunch_time';
  }

  return defaultType;
};
