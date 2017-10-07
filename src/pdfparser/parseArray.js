import { arrayToString, trimArray, arrayCharAt } from '../utils';

import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseDict from './parseDict';

const parseArray = (input, parseHandlers={}) => {
  const array = [];
  const trimmed = trimArray(input);
  if (arrayCharAt(trimmed, 0) !== '[') return null;

  let remainder = trimmed.subarray(1); // Remove the '['
  while (arrayCharAt(trimArray(remainder), 0) !== ']') {
    // Parse the value for this element
    const [ pdfObject, r ] =
      parseNull(remainder, parseHandlers)        ||
      parseIndirectRef(remainder, parseHandlers) ||
      parseString(remainder, parseHandlers)      ||
      parseHexString(remainder, parseHandlers)   ||
      parseName(remainder, parseHandlers)        ||
      parseBool(remainder, parseHandlers)        ||
      parseNumber(remainder, parseHandlers)      ||
      parseArray(remainder, parseHandlers)       ||
      parseDict(remainder, parseHandlers);

    array.push(pdfObject);
    remainder = r;
  }
  const remainderTrim = trimArray(remainder);
  if (arrayCharAt(remainderTrim, 0) !== ']') throw new Error('Mismatched brackets!');
  remainder = trimArray(remainderTrim.subarray(1)); // Remove the ']'

  const { onParseArray=() => {} } = parseHandlers;
  return [ onParseArray(array) || array, remainder];
}

export default parseArray;
