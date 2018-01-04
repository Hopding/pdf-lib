/* @flow */
import { PDFIndirectObject } from '../pdf-objects';
import { error, arrayIndexOf, trimArray, arrayToString } from '../../utils';

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

import type { ParseHandlers } from './PDFParser';

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Indirect Object.

If so, returns a tuple containing (1) an object representing the parsed PDF
Indirect Object and (2) a subarray of the input with the characters making up
the parsed indirect object removed. The "onParseIndirectObj" parse handler will
also be called with the PDFIndirectObject.

If not, null is returned.
*/
const parseIndirectObj = (
  input: Uint8Array,
  parseHandlers: ParseHandlers = {},
): ?[PDFIndirectObject<*>, Uint8Array] => {
  const trimmed = trimArray(input);
  const indirectObjRegex = /^(\d+) (\d+) obj/;

  // Check that initial characters make up an indirect object "header"
  const objIdx = arrayIndexOf(trimmed, 'obj');
  const result = arrayToString(trimmed.subarray(0, objIdx + 3)).match(
    indirectObjRegex,
  );
  if (!result) return null;

  // eslint-disable-next-line no-unused-vars
  const [fullMatch, objNum, genNum] = result;

  // Extract the bytes making up the object itself
  const endobjIdx = arrayIndexOf(trimmed, 'endobj', objIdx);
  const content = trimmed.subarray(objIdx + 3, endobjIdx);

  // Try to parse the object bytes
  const [contentObj, r] =
    parseNull(content, parseHandlers) ||
    parseStream(content, parseHandlers) ||
    parseIndirectRef(content, parseHandlers) ||
    parseString(content, parseHandlers) ||
    parseHexString(content, parseHandlers) ||
    parseName(content, parseHandlers) ||
    parseBool(content, parseHandlers) ||
    parseNumber(content, parseHandlers) ||
    parseArray(content, parseHandlers) ||
    parseDict(content, parseHandlers) ||
    error('Failed to parse object contents');

  if (trimArray(r).length > 0) error('Incorrectly parsed object contents');

  const indirectObj = PDFIndirectObject.of(contentObj).setReferenceNumbers(
    Number(objNum),
    Number(genNum),
  );
  if (parseHandlers.onParseIndirectObj) {
    parseHandlers.onParseIndirectObj(indirectObj);
  }
  return [indirectObj, trimmed.subarray(endobjIdx + 6)];
};

export default parseIndirectObj;
