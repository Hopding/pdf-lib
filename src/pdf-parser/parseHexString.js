import { arrayToString, arrayIndexOf, arrayCharAt, trimArray } from '../utils';

const parseHexString = (input, parseHandlers = {}) => {
  const hexStringRegex = /^<([\dABCDEFabcdef]*)>/;

  const trimmed = trimArray(input);
  let idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[<(\dABCDEFabcdef]/)) idx++;
  const result = arrayToString(trimmed, 0, idx + 2).match(hexStringRegex);
  if (!result) return null;

  const [fullMatch, hexString] = result;
  const { onParseHexString = () => {} } = parseHandlers;
  return [
    onParseHexString(hexString) || hexString,
    trimmed.subarray(fullMatch.length),
  ];
};

export default parseHexString;
