import StringView from '../StringView';

import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseDict from './parseDict';

// const parseArray = (input, parseHandlers={}) => {
//   const array = [];
//   const trimmed = input.trim();
//   if (trimmed.charAt(0) !== '[') return null;
//
//   let remainder = trimmed.substring(1).trim(); // Remove starting '[' bracket
//   while (remainder.charAt(0) !== ']' && remainder.length > 0) {
//     const { pdfObject, remainder: r } =
//       parseNull(remainder, parseHandlers)        ||
//       parseIndirectRef(remainder, parseHandlers) ||
//       parseString(remainder, parseHandlers)      ||
//       parseHexString(remainder, parseHandlers)   ||
//       parseName(remainder, parseHandlers)        ||
//       parseBool(remainder, parseHandlers)        ||
//       parseNumber(remainder, parseHandlers)      ||
//       parseArray(remainder, parseHandlers)       ||
//       parseDict(remainder, parseHandlers);
//
//     array.push(pdfObject);
//     remainder = r;
//   }
//
//   if (remainder.charAt(0) !== ']') throw new Error('Mismatched brackets!');
//   remainder = remainder.substring(1).trim(); // Remove ending ']' bracket
//
//   const { onParseArray=() => {} } = parseHandlers;
//   return { pdfObject: onParseArray(array) || array, remainder };
// }

// const parseArray = (input, startIdx, parseHandlers={}) => {
//   const array = [];
//   const trimmed = input.trim();
//   if (trimmed.charAt(0) !== '[') return null;
//
//   let remainder = trimmed.substring(1).trim(); // Remove starting '[' bracket
//   while (remainder.charAt(0) !== ']' && remainder.length > 0) {
//     const { pdfObject, remainder: r } =
//       parseNull(remainder, parseHandlers)        ||
//       parseIndirectRef(remainder, parseHandlers) ||
//       parseString(remainder, parseHandlers)      ||
//       parseHexString(remainder, parseHandlers)   ||
//       parseName(remainder, parseHandlers)        ||
//       parseBool(remainder, parseHandlers)        ||
//       parseNumber(remainder, parseHandlers)      ||
//       parseArray(remainder, parseHandlers)       ||
//       parseDict(remainder, parseHandlers);
//
//     array.push(pdfObject);
//     remainder = r;
//   }
//
//   if (remainder.charAt(0) !== ']') throw new Error('Mismatched brackets!');
//   remainder = remainder.substring(1).trim(); // Remove ending ']' bracket
//
//   const { onParseArray=() => {} } = parseHandlers;
//   return { pdfObject: onParseArray(array) || array, remainder };
// }

const parseArray = (input, startIdx, parseHandlers) => {
  const array = [];
  const inputStr = (new StringView(input)).subview(startIdx).toString();
  const trimmed = inputStr.trim();
  if (inputStr.trim().substring(0, 1) !== '[') return null;

  // let remainder = trimmed.substring(2).trim(); // Remove starting '<<'
  let remainingIdx = startIdx + inputStr.indexOf('[') + 1;
  while ((new StringView(input)).subview(remainingIdx).toString().trim().substring(0, 1) !== ']' && remainingIdx < input.length) {
    // Parse the value for this element
    const [ pdfObject, r2 ] =
      parseNull(input, remainingIdx , parseHandlers)        ||
      parseIndirectRef(input, remainingIdx, parseHandlers) ||
      parseString(input, remainingIdx, parseHandlers)      ||
      parseHexString(input, remainingIdx, parseHandlers)   ||
      parseName(input, remainingIdx, parseHandlers)        ||
      parseBool(input, remainingIdx, parseHandlers)        ||
      parseNumber(input, remainingIdx, parseHandlers)      ||
      parseArray(input, remainingIdx, parseHandlers)       ||
      parseDict(input, remainingIdx, parseHandlers);

    array.push(pdfObject);
    remainingIdx = r2;
  }
  if ((new StringView(input)).subview(remainingIdx).toString().trim().substring(0, 1) !== ']') throw new Error('Mismatched brackets!');
  remainingIdx = (new StringView(input)).toString().indexOf(']', remainingIdx) + 1; // Remove ending '>>' pair

  const { onParseArray=() => {} } = parseHandlers;
  // return { pdfObject: onParseDict(obj) || obj, remainder };
  return [ onParseArray(array) || array, remainingIdx];
}


export default parseArray;
