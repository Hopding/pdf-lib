import { arrayIndexOf, trimArray, arrayToString } from '../utils';

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

const parseIndirectObj = (input, parseHandlers={}) => {
  const trimmed = trimArray(input);
  const indirectObjRegex = /^(\d+)\ (\d+)\ obj/;
  const objIdx = arrayIndexOf(trimmed, 'obj');
  const result = arrayToString(trimmed.subarray(0, objIdx + 3)).match(indirectObjRegex);
  if (!result) return null;

  const [fullMatch, objNum, genNum] = result;
  const endobjIdx = arrayIndexOf(trimmed, 'endobj', objIdx);
  const content = trimmed.subarray(objIdx + 3, endobjIdx);

  const [contentObj, r] =
    parseNull(content, parseHandlers)       ||
    parseStream(content, parseHandlers)      ||
    parseIndirectRef(content, parseHandlers) ||
    parseString(content, parseHandlers)      ||
    parseHexString(content, parseHandlers)   ||
    parseName(content, parseHandlers)        ||
    parseBool(content, parseHandlers)        ||
    parseNumber(content, parseHandlers)      ||
    parseArray(content, parseHandlers)       ||
    parseDict(content, parseHandlers);

  if (trimArray(r).length > 0) throw new Error('Failed to parse object contents');

  const { onParseIndirectObj=() => {} } = parseHandlers;
  const obj = { objNum, genNum, contentObj };
  return [onParseIndirectObj(obj) || obj, trimmed.subarray(endobjIdx + 6)];
}

export default parseIndirectObj;
