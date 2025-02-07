import { isArray, trim } from 'lodash';
import { DateTime } from 'luxon';
import { DefaultTranslation } from './constants';
import { DirectusEventScope, TranslationMapType } from './types';

export const DATE_TIMEZONE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss'Z'";

export function getTranslationMap(
  translationList: object[],
  fieldName: string,
  defaultTranslationMap: TranslationMapType = DefaultTranslation,
): TranslationMapType {
  return translationList.reduce(
    (acc: any, cur: any) => ({
      ...acc,
      [cur.languages_code]: trim(cur[fieldName]),
    }),
    { ...defaultTranslationMap },
  );
}

export function shortenLangCode(translationMap: TranslationMapType): TranslationMapType {
  const langKeys = Object.keys(translationMap);
  let enText = translationMap['en-US'];
  let thText = translationMap['en-TH'];

  if (enText === '') {
    // find en language code
    const enLangCode = langKeys.find((lang) => lang.startsWith('en') && translationMap[lang] !== '');

    if (enLangCode) enText = translationMap[enLangCode];
  }

  if (thText === '') {
    // find th language code
    const thLangCode = langKeys.find((lang) => lang.startsWith('th') && translationMap[lang] !== '');

    if (thLangCode) thText = translationMap[thLangCode];
  }

  return {
    en: enText,
    th: thText,
  };
}

export function getCompactTranslationMap(
  translationList: object[],
  fieldName: string,
  defaultTranslationMap?: TranslationMapType,
): TranslationMapType {
  return shortenLangCode(getTranslationMap(translationList, fieldName, defaultTranslationMap));
}

export function generateOneDayRangeFilter() {
  const from = DateTime.now();
  const to = from.plus({ hours: 24 });

  return {
    _and: [{ event_start_date_time: { _gte: from.toISO() } }, { event_start_date_time: { _lt: to.toISO() } }],
  };
}

export function generateOneDayRangeParams() {
  const from = DateTime.now();
  const to = from.plus({ hours: 24 });

  return { from: from.toISO(), to: to.toISO() };
}

export function validateDirectusFlowKey(data: { keys: string[]; key: string; event: string }) {
  const { keys, key, event } = data ?? {};

  const triggerType = event.split('.').pop();
  return (
    (triggerType === DirectusEventScope.UPDATE && keys && isArray(keys) && keys.length !== 0) ||
    (triggerType === DirectusEventScope.CREATE && (key || key !== ''))
  );
}
