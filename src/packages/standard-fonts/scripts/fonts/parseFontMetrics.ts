import {
  error,
  extractLinesFromSection,
  takeAfterFirstSpace,
  takeUntilFirstSpace,
} from './utils';

export interface IFontMetrics {
  Comment: string;
  FontName: string;
  FullName: string;
  FamilyName: string;
  Weight: string;
  CharacterSet: string;
  Version: string;
  Notice: string;
  EncodingScheme: string;
  ItalicAngle: number;
  UnderlinePosition: number;
  UnderlineThickness: number;
  CapHeight: number | void;
  XHeight: number | void;
  Ascender: number | void;
  Descender: number | void;
  StdHW: number;
  StdVW: number;
  IsFixedPitch: boolean;
  FontBBox: [number, number, number, number];
}

export type IFontMetricKey = keyof IFontMetrics;

const stringFontMetricKeys = [
  'Comment',
  'FontName',
  'FullName',
  'FamilyName',
  'Weight',
  'CharacterSet',
  'Version',
  'Notice',
  'EncodingScheme',
];
const numericFontMetricKeys = [
  'ItalicAngle',
  'UnderlinePosition',
  'UnderlineThickness',
  'CapHeight',
  'XHeight',
  'Ascender',
  'Descender',
  'StdHW',
  'StdVW',
];
const booleanFontMetricKeys = ['IsFixedPitch'];
const arrayFontMetricKeys = ['FontBBox'];

// prettier-ignore
const parseFontMetric = (
  // E.g. 'FontBBox -113 -250 749 801'
  line: string,
) => {
  // E.g. 'FontBBox'
  const key = takeUntilFirstSpace(line) as IFontMetricKey;

  // E.g. '-113 -250 749 801'
  const rawValue = takeAfterFirstSpace(line).trim();

  return (
      stringFontMetricKeys.includes(key)  ? { key, value: String(rawValue) }
    : numericFontMetricKeys.includes(key) ? { key, value: Number(rawValue) }
    : booleanFontMetricKeys.includes(key) ? { key, value: Boolean(rawValue) }
    : arrayFontMetricKeys.includes(key)   ? { key, value: rawValue.split(' ').map(Number) }
    : error(`Unrecognized font metric key: "${key}"`)
  );
};

export const parseFontMetricsSection = (data: string): IFontMetrics => {
  const metrics = extractLinesFromSection(data, {
    startAt: 'StartFontMetrics',
    endAt: 'StartCharMetrics',
  }).map(parseFontMetric);

  return metrics.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {}) as IFontMetrics;
};
