import {
  arrayToString,
  trimArray,
  arrayCharAt,
  writeToDebugFile,
} from '../utils';

import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseArray from './parseArray';

const parseDict = (input, parseHandlers = {}) => {
  const obj = {};
  const trimmed = trimArray(input);
  if (arrayToString(trimmed, 0, 2) !== '<<') return null;

  let remainder = trimArray(trimmed.subarray(2));
  while (arrayToString(trimArray(remainder), 0, 2) !== '>>') {
    // Parse the key for this entry
    const [key, r1] = parseName(remainder);
    remainder = r1;

    // Parse the value for this entry
    const [pdfObject, r2] =
      parseNull(remainder, parseHandlers) ||
      parseIndirectRef(remainder, parseHandlers) ||
      parseString(remainder, parseHandlers) ||
      parseHexString(remainder, parseHandlers) ||
      parseName(remainder, parseHandlers) ||
      parseBool(remainder, parseHandlers) ||
      parseNumber(remainder, parseHandlers) ||
      parseArray(remainder, parseHandlers) ||
      parseDict(remainder, parseHandlers);

    // TODO: UPDATE THIS SO THAT DUPLICATE KEYS AREN'T BEING MADE
    obj[key.key] = pdfObject;
    remainder = r2;
  }
  const remainderTrim = trimArray(remainder);
  if (arrayToString(remainderTrim, 0, 2) !== '>>') {
    throw new Error('Mismatched brackets!');
  }

  remainder = trimArray(remainderTrim.subarray(2)); // Remove ending '>>' pair
  const { onParseDict = () => {} } = parseHandlers;
  return [onParseDict(obj) || obj, remainder];
};

export default parseDict;
