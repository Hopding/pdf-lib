import {
  error,
  extractLinesFromSection,
  takeAfterFirstSpace,
  takeUntilFirstSpace,
} from './utils';

export interface ICharMetrics {
  C: number;
  WX: number;
  N: string;
  B: [number, number, number, number];
  L: Array<[string, string]>;
}

type ICharMetricKey = keyof ICharMetrics;

const byKey = (key: ICharMetricKey) => (obj) => obj.key === key;

/**
 * From https://www.adobe.com/content/dam/acom/en/devnet/font/pdfs/5004.AFM_Spec.pdf :
 *
 * C integer:
 *   Decimal value of default character code (−1 if not encoded).
 *
 * WX number:
 *   Width of character.
 *
 * N name:
 *   (Optional.) PostScript language character name.
 *
 * B llx lly urx ury:
 *   (Optional.) Character bounding box where llx, lly, urx, and ury are all
 *   numbers. If a character makes no marks on the page (for example, the space
 *   character), this fi eld reads B 0 0 0 0 , and these values are not
 *   considered when computing the FontBBox.
 *
 * L successor ligature:
 *   (Optional.) Ligature sequence where successor and ligature are both names.
 *   The current character may join with the character named successor to form
 *   the character named ligature. Note that characters can have more than one
 *   such entry.
 *
 * Fallback link for AFM Spec:
 *   https://ia800603.us.archive.org/30/items/afm-format/afm-format.pdf
 */

// prettier-ignore
const parseMetric = (
  // E.g. 'B 56 -45 544 651'
  metric: string,
) => {
  // E.g. 'B'
  const key = takeUntilFirstSpace(metric) as ICharMetricKey;

  // E.g. '56 -45 544 651'
  const rawValue = takeAfterFirstSpace(metric);

  return (
      key === 'C'  ? { key, value: Number(rawValue) }
    : key === 'WX' ? { key, value: Number(rawValue) }
    : key === 'N'  ? { key, value: String(rawValue) }
    : key === 'B'  ? { key, value: rawValue.split(' ').map(Number) }
    : key === 'L'  ? { key, value: rawValue.split(' ').map(String) }
    : error(`Unrecognized character metric key: "${key}"`)
  );
};

const parseCharMetrics = (
  // E.g. 'C 35 ; WX 600 ; N numbersign ; B 56 -45 544 651 ;'
  line: string,
): ICharMetrics => {
  const SEMICOLON_WITH_SURROUDING_WHITESPACE = /\s*;\s*/;
  const NON_EMPTY = (str) => str !== '';

  const metrics = line
    // E.g. ['C 35', 'WX 600', 'N numbersign', 'B 56 -45 544 651', '']
    .split(SEMICOLON_WITH_SURROUDING_WHITESPACE)
    // E.g. ['C 35', 'WX 600', 'N numbersign', 'B 56 -45 544 651']
    .filter(NON_EMPTY)
    // E.g. [
    //        { key: 'C',  value: 35 },
    //        { key: 'WX', value: 600 },
    //        { key: 'N',  value: 'numbersign' },
    //        { key: 'B',  value: [56, -45, 544, 651] }
    //      ]
    .map(parseMetric);

  // We'll leave out C, B, and L to save space in the resulting JSON
  return {
    // C: metrics.find(byKey('C')).value,
    WX: metrics.find(byKey('WX')).value,
    N: metrics.find(byKey('N')).value,
    // B: metrics.find(byKey('B')).value,
    // L: metrics.filter(byKey('L')).map((l) => l.value),
  } as ICharMetrics;
};

export const parseCharMetricsSection = (data: string): ICharMetrics[] => {
  return extractLinesFromSection(data, {
    startAt: 'StartCharMetrics',
    endAt: 'EndCharMetrics',
  }).map(parseCharMetrics);
};
