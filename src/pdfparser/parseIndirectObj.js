import StringView from '../StringView';
import { arrayIndexOf } from '../utils';

import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseDict from './parseDict';
import parseArray from './parseArray';
import parseStream from './parseStream';
//
// const parseIndirectObj = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//   const indirectObjRegex = /^(\d+)\ (\d+)\ obj/;
//   const result = trimmed.match(indirectObjRegex);
//   if (!result) return null;
//
//   const [fullMatch, objNum, genNum] = result;
//   const endobjIdx = trimmed.indexOf('endobj');
//   const content = trimmed.substring(fullMatch.length, endobjIdx);
//
//   const { pdfObject: contentObj, remainder: r } =
//     parseNull(content, parseHandlers)        ||
//     parseStream(content, parseHandlers)      ||
//     parseIndirectRef(content, parseHandlers) ||
//     parseString(content, parseHandlers)      ||
//     parseHexString(content, parseHandlers)   ||
//     parseName(content, parseHandlers)        ||
//     parseBool(content, parseHandlers)        ||
//     parseNumber(content, parseHandlers)      ||
//     parseArray(content, parseHandlers)       ||
//     parseDict(content, parseHandlers);
//   if (r.trim().length > 0) throw new Error('Failed to parse object contents');
//
//   const { onParseIndirectObj=() => {} } = parseHandlers;
//   const obj = { objNum, genNum, contentObj };
//   return {
//     pdfObject: onParseIndirectObj(obj) || obj,
//     remainder: trimmed.substring(endobjIdx + 6).trim(),
//   };
// }


const parseIndirectObj = (input, startIdx, parseHandlers={}) => {
  const sv = (new StringView(input)).subview(startIdx);
  console.log('parsing indirect obj with: ', (new StringView(input)).subview(startIdx, startIdx + 10).toString())
  const indirectObjRegex = /^[\n\ ]*(\d+)\ (\d+)\ obj/;
  const result = sv.match(indirectObjRegex);
  if (!result) return null;

  const [fullMatch, objNum, genNum] = result;
  // const endobjIdx = trimmed.indexOf('endobj');
  console.log('Looking for "endobj"')
  const endobjIdx = arrayIndexOf(input, 'endobj', startIdx);
  console.log('Found "endobj":', endobjIdx)
  // const content = trimmed.substring(fullMatch.length, endobjIdx);
  const contentStart = startIdx + fullMatch.length + 1;

  const [contentObj, stopIdx] =
    parseNull(input, contentStart, parseHandlers)       ||
    parseStream(input, contentStart, parseHandlers)      ||
    parseIndirectRef(input, contentStart, parseHandlers) ||
    parseString(input, contentStart, parseHandlers)      ||
    parseHexString(input, contentStart, parseHandlers)   ||
    parseName(input, contentStart, parseHandlers)        ||
    parseBool(input, contentStart, parseHandlers)        ||
    parseNumber(input, contentStart, parseHandlers)      ||
    parseArray(input, contentStart, parseHandlers)       ||
    parseDict(input, contentStart, parseHandlers) ||
     [9000, 9000]

  // TODO: Fix next line
  // if (r.trim().length > 0) throw new Error('Failed to parse object contents');

  const { onParseIndirectObj=() => {} } = parseHandlers;
  const obj = { objNum, genNum, contentObj };
  // return {
  //   pdfObject: onParseIndirectObj(obj) || obj,
  //   remainder: trimmed.substring(endobjIdx + 6).trim(),
  // };
  return [onParseIndirectObj(obj) || obj, endobjIdx + 6];
}

export default parseIndirectObj;
