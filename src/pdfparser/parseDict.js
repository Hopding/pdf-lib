import StringView from '../StringView';

import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseArray from './parseArray';

// const parseDict = (input, parseHandlers) => {
//   const obj = {};
//   const trimmed = input.trim();
//   if (trimmed.substring(0, 2) !== '<<') return null;
//
//   let remainder = trimmed.substring(2).trim(); // Remove starting '<<'
//   while (remainder.substring(0, 2) !== '>>' && remainder.length > 0) {
//     // Parse the key for this entry
//     const { pdfObject: key, remainder: r1 } = parseName(remainder);
//     remainder = r1;
//
//     // Parse the value for this entry
//     const { pdfObject, remainder: r2 } =
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
//     obj[key] = pdfObject;
//     remainder = r2;
//   }
//   if (remainder.substring(0, 2) !== '>>') throw new Error('Mismatched brackets!');
//   remainder = remainder.substring(2).trim(); // Remove ending '>>' pair
//
//   const { onParseDict=() => {} } = parseHandlers;
//   return { pdfObject: onParseDict(obj) || obj, remainder };
// }

const parseDict = (input, startIdx, parseHandlers) => {
  const obj = {};
  const inputStr = (new StringView(input)).subview(startIdx).toString();
  const trimmed = inputStr.trim();
  if (inputStr.trim().substring(0, 2) !== '<<') return null;

  // let remainder = trimmed.substring(2).trim(); // Remove starting '<<'
  let remainingIdx = startIdx + inputStr.indexOf('<<') + 2;
  while ((new StringView(input)).subview(remainingIdx).toString().trim().substring(0, 2) !== '>>' && remainingIdx < input.length) {
    // let remainingIdx = startIdx + (inputStr.length - remainder.length) + inputStr.indexOf('<<');

    // Parse the key for this entry
    const [ key, r1 ] = parseName(input, remainingIdx);
    remainingIdx = r1;

    // Parse the value for this entry
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

    obj[key] = pdfObject;
    remainingIdx = r2;
  }
  if ((new StringView(input)).subview(remainingIdx).toString().trim().substring(0, 2) !== '>>') throw new Error('Mismatched brackets!');
  remainingIdx = (new StringView(input)).toString().indexOf('>>', remainingIdx) + 2; // Remove ending '>>' pair

  const { onParseDict=() => {} } = parseHandlers;
  // return { pdfObject: onParseDict(obj) || obj, remainder };
  return [ onParseDict(obj) || obj, remainingIdx];
}

export default parseDict;
