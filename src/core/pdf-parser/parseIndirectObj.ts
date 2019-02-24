// tslint:disable-next-line:no-unused-variable
import { PDFIndirectObject, PDFObject } from 'core/pdf-objects';
import {
  arrayIndexOf,
  arrayToString,
  error,
  trimArrayAndRemoveComments,
} from 'utils';

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
  const trimmed = trimArrayAndRemoveComments(input);
  const indirectObjRegex = /^(\d+)[\0\t\n\f\r ]*(\d+)[\0\t\n\f\r ]*obj/;

  // Check that initial characters make up an indirect object "header"
  const objIdx = arrayIndexOf(trimmed, 'obj')!;
  const result = arrayToString(trimmed.subarray(0, objIdx + 3)).match(
    indirectObjRegex,
  );
  if (!result) return undefined;

  const [_fullMatch, objNum, genNum] = result;

  // Remove the indirect object "header" from the trimmed input
  const afterHeader = trimArrayAndRemoveComments(trimmed.subarray(objIdx + 3));

  // Try to parse the object contents bytes
  const [contentObj, r] =
    parseDictOrStream(afterHeader, index, parseHandlers) ||
    parseArray(afterHeader, index, parseHandlers) ||
    parseName(afterHeader, parseHandlers) ||
    parseString(afterHeader, parseHandlers) ||
    parseIndirectRef(afterHeader, parseHandlers) ||
    parseNumber(afterHeader, parseHandlers) ||
    parseHexString(afterHeader, parseHandlers) ||
    parseBool(afterHeader, parseHandlers) ||
    parseNull(afterHeader, parseHandlers) ||
    error('Failed to parse object contents');

  const trimmedRemaining = trimArrayAndRemoveComments(r);

  // Make sure we're now at the end of the object
  const endobjIdx = arrayIndexOf(trimmedRemaining, 'endobj');
  if (endobjIdx === undefined) throw new Error('Invalid Indirect Object');
  if (endobjIdx !== 0) throw new Error('Incorrectly parsed object contents');

  const indirectObj = PDFIndirectObject.of(contentObj).setReferenceNumbers(
    Number(objNum),
    Number(genNum),
  );
  if (parseHandlers.onParseIndirectObj) {
    parseHandlers.onParseIndirectObj(indirectObj);
  }
  return [indirectObj, trimmedRemaining.subarray(6)];
};

export default parseIndirectObj;
