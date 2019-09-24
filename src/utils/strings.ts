export const toCharCode = (character: string) => character.charCodeAt(0);

export const toCodePoint = (character: string) => character.codePointAt(0);

export const toHexStringOfMinLength = (num: number, minLength: number) =>
  padStart(num.toString(16), minLength, '0').toUpperCase();

export const toHexString = (num: number) => toHexStringOfMinLength(num, 2);

export const charFromCode = (code: number) => String.fromCharCode(code);

export const charFromHexCode = (hex: string) => charFromCode(parseInt(hex, 16));

export const padStart = (value: string, length: number, padChar: string) => {
  let padding = '';
  for (let idx = 0, len = length - value.length; idx < len; idx++) {
    padding += padChar;
  }
  return padding + value;
};

export const copyStringIntoBuffer = (
  str: string,
  buffer: Uint8Array,
  offset: number,
): number => {
  const length = str.length;
  for (let idx = 0; idx < length; idx++) {
    buffer[offset++] = str.charCodeAt(idx);
  }
  return length;
};

export const addRandomSuffix = (prefix: string, suffixLength = 4) =>
  `${prefix}-${Math.floor(Math.random() * 10 ** suffixLength)}`;

export const escapeRegExp = (str: string) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const cleanText = (text: string) =>
  text.replace(/\t/g, '    ').replace(/[\b\v]/g, '');

const buildWordBreakRegex = (wordBreaks: string[]) => {
  const escapedRules: string[] = ['$'];
  for (let idx = 0, len = wordBreaks.length; idx < len; idx++) {
    const wordBreak = wordBreaks[idx];
    if (wordBreak.includes('\n') || wordBreak.includes('\r')) {
      throw new TypeError('`wordBreak` must not include \\n or \\r');
    }
    escapedRules.push(wordBreak === '' ? '.' : escapeRegExp(wordBreak));
  }
  const breakRules = escapedRules.join('|');
  return new RegExp(`(\\n|\\r)|((.*?)(${breakRules}))`, 'gm');
};

export const breakTextIntoLines = (
  text: string,
  wordBreaks: string[],
  maxWidth: number,
  computeWidthOfText: (t: string) => number,
): string[] => {
  const regex = buildWordBreakRegex(wordBreaks);

  const words = cleanText(text).match(regex)!;

  let currLine = '';
  let currWidth = 0;
  const lines: string[] = [];

  const pushCurrLine = () => {
    if (currLine !== '') lines.push(currLine);
    currLine = '';
    currWidth = 0;
  };

  for (let idx = 0, len = words.length; idx < len; idx++) {
    const word = words[idx];
    if (word === '\n' || word === '\r') {
      pushCurrLine();
    } else {
      const width = computeWidthOfText(word);
      if (currWidth + width > maxWidth) pushCurrLine();
      currLine += word;
      currWidth += width;
    }
  }
  pushCurrLine();

  return lines;
};
