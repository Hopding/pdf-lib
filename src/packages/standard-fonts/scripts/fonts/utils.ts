export const takeUntilFirstSpace = (str: string): string =>
  str.substring(0, str.indexOf(' '));

export const takeAfterFirstSpace = (str: string): string =>
  str.substring(str.indexOf(' ') + 1);

export const error = (msg: string) => {
  throw new Error(msg);
};

export type ISectionName =
  | 'StartFontMetrics'
  | 'StartCharMetrics'
  | 'StartKernPairs'
  | 'EndFontMetrics'
  | 'EndCharMetrics'
  | 'EndKernPairs';

export const extractLinesFromSection = (
  data: string,
  { startAt, endAt }: { startAt: ISectionName; endAt: ISectionName },
) => {
  // E.g. /^StartFontMetrics\s+\d+(\.\d+)?/m
  const startRegex = new RegExp(`^${startAt}\\s+\\d+(\\.\\d+)?`, 'm');

  // E.g. /^StartCharMetrics/m
  const endRegex = new RegExp(`^${endAt}`, 'm');

  const startMatch = data.match(startRegex);
  if (!startMatch) return [];
  const endMatch = data.match(endRegex);

  const startIdx = startMatch.index + startMatch[0].length;

  const sectionData = data.slice(startIdx, endMatch.index);
  const sectionLines = sectionData.trim().split(/\r\n|\r|\n|\t/);

  return sectionLines;
};
