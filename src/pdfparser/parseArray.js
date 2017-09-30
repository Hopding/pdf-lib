import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseDict from './parseDict';

// const parseArray = (input, parseHandlers) => {
//   const {
//     onParseNull,
//     onParseIndirectRef,
//     onParseString,
//     onParseHexString,
//     onParseName,
//     onParseBool,
//     onParseNumber,
//     onParseArray,
//     onParseDict,
//   } = parseHandlers;
const parseArray = (input, parseHandlers={}) => {
  const array = [];
  const trimmed = input.trim();
  if (trimmed.charAt(0) !== '[') return null;

  let remainder = trimmed.substring(1).trim(); // Remove starting '[' bracket
  while (remainder.charAt(0) !== ']' && remainder.length > 0) {
    const { pdfObject, remainder: r } =
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

  if (remainder.charAt(0) !== ']') throw new Error('Mismatched brackets!');
  remainder = remainder.substring(1).trim(); // Remove ending ']' bracket

  const { onParseArray=() => {} } = parseHandlers;
  return { pdfObject: onParseArray(array) || array, remainder };
}

export default parseArray;
