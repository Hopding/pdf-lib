// tslint:disable-next-line:no-unused-variable
import { PDFIndirectObject, PDFObject } from 'core/pdf-objects';
import { arrayIndexOf, arrayToString, error, trimArray } from 'utils';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import parseArray from './parseArray';
import parseBool from './parseBool';
import parseDictOrStream from './parseDictOrStream';
import parseHexString from './parseHexString';
import parseIndirectRef from './parseIndirectRef';
import parseName from './parseName';
import parseNull from './parseNull';
import parseNumber from './parseNumber';
import parseString from './parseString';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in the
 * trimmed input make up a PDF Indirect Object.
 *
 * If so, returns a tuple containing (1) an object representing the parsed PDF
 * Indirect Object and (2) a subarray of the input with the characters making up
 * the parsed indirect object removed. The "onParseIndirectObj" parse handler will
 * also be called with the PDFIndirectObject.
 *
 * If not, null is returned.
 */
const parseIndirectObj = (
  input: Uint8Array,
  index: PDFObjectIndex,
  parseHandlers: IParseHandlers = {},
): [PDFIndirectObject, Uint8Array] | void => {
  const trimmed = trimArray(input);
  const indirectObjRegex = /^(\d+)[\0\t\n\f\r ]*(\d+)[\0\t\n\f\r ]*obj/;

  // Check that initial characters make up an indirect object "header"
  const objIdx = arrayIndexOf(trimmed, 'obj')!;
  const result = arrayToString(trimmed.subarray(0, objIdx + 3)).match(
    indirectObjRegex,
  );
  if (!result) return undefined;

  // eslint-disable-next-line no-unused-vars
  const [_fullMatch, objNum, genNum] = result;

  // Extract the bytes making up the object itself
  const endobjIdx = arrayIndexOf(trimmed, 'endobj', objIdx)!;
  const content = trimmed.subarray(objIdx + 3, endobjIdx);

  // Try to parse the object bytes
  const [contentObj, r] =
    parseDictOrStream(content, index, parseHandlers) ||
    parseArray(content, index, parseHandlers) ||
    parseName(content, parseHandlers) ||
    parseString(content, parseHandlers) ||
    parseIndirectRef(content, parseHandlers) ||
    parseNumber(content, parseHandlers) ||
    parseHexString(content, parseHandlers) ||
    parseBool(content, parseHandlers) ||
    parseNull(content, parseHandlers) ||
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
