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
