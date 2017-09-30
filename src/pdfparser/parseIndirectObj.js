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

// const parseIndirectObj = (
//   input,
//   {
//     onParseIndirectObj,
//     onParseNull,
//     onParseBool,
//     onParseString,
//     onParseHexString,
//     onParseNumber,
//     onParseArray,
//     onParseDict,
//     onParseName,
//     onParseIndirectRef,
//     onParseStream,
//   },
// ) => {
const parseIndirectObj = (input, parseHandlers={}) => {
  const trimmed = input.trim();
  const indirectObjRegex = /^(\d+)\ (\d+)\ obj/;
  const result = trimmed.match(indirectObjRegex);
  if (!result) return null;

  const [fullMatch, objNum, genNum] = result;
  const endobjIdx = trimmed.indexOf('endobj');
  const content = trimmed.substring(fullMatch.length, endobjIdx);

  const { pdfObject: contentObj, remainder: r } =
    parseNull(content, parseHandlers)        ||
    parseStream(content, parseHandlers)      ||
    parseIndirectRef(content, parseHandlers) ||
    parseString(content, parseHandlers)      ||
    parseHexString(content, parseHandlers)   ||
    parseName(content, parseHandlers)        ||
    parseBool(content, parseHandlers)        ||
    parseNumber(content, parseHandlers)      ||
    parseArray(content, parseHandlers)       ||
    parseDict(content, parseHandlers);
  if (r.trim().length > 0) throw new Error('Failed to parse object contents');

  const { onParseIndirectObj=() => {} } = parseHandlers;
  const obj = { objNum, genNum, contentObj };
  return {
    pdfObject: onParseIndirectObj(obj) || obj,
    remainder: trimmed.substring(endobjIdx + 6).trim(),
  };
}

export default parseIndirectObj;
