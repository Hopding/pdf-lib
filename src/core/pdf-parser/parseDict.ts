import { PDFDictionary, PDFName } from 'core/pdf-objects';
import {
  PDFCatalog,
  PDFLinearizationParams,
  PDFPage,
  PDFPageTree,
} from 'core/pdf-structures';
import { arrayToString, error, trimArray } from 'utils';
import { isIdentity, validate } from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import parseArray from './parseArray';
import parseBool from './parseBool';
import parseHexString from './parseHexString';
import parseIndirectRef from './parseIndirectRef';
import parseName from './parseName';
import parseNull from './parseNull';
import parseNumber from './parseNumber';
import parseString from './parseString';

import { IParseHandlers } from './PDFParser';

// prettier-ignore
const typeDict = (dict: PDFDictionary) => {
  if (dict.getMaybe('Linearized')) return PDFLinearizationParams.fromDict(dict);
  switch (dict.getMaybe('Type')) {
    case PDFName.from('Catalog'): return PDFCatalog.fromDict(dict);
    case PDFName.from('Pages'):   return PDFPageTree.fromDict(dict);
    case PDFName.from('Page'):    return PDFPage.fromDict(dict);
    default:                      return dict;
  }
};

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in
 * the trimmed input make up a PDF Dictionary.
 *
 * If so, returns a tuple containing (1) an object representing the parsed
 * PDFDictionary and (2) a subarray of the input with the characters making up
 * the parsed dictionary removed. The "onParseDict" parse handler will also be
 * called with the PDFDictionary object.
 *
 * If not, null is returned.
 *
 * Note that the entries of the PDF Dictionary are recursively parsed, so the
 * appropriate parse handlers will be called when each entry of the dictionary
 * is parsed. The returned PDFDictionary's keys will be PDFName objects, and its
 * values will be PDFObjects.
 */
const parseDict = (
  input: Uint8Array,
  index: PDFObjectIndex,
  parseHandlers: IParseHandlers = {},
): [PDFDictionary, Uint8Array] | void => {
  const trimmed = trimArray(input);
  if (arrayToString(trimmed, 0, 2) !== '<<') return undefined;
  const pdfDict = PDFDictionary.from(new Map(), index);

  // Recursively parse each entry in the dictionary
  let remainder = trimArray(trimmed.subarray(2));
  while (arrayToString(trimArray(remainder), 0, 2) !== '>>') {
    // Parse the key for this entry
    const [key, r1] =
      parseName(remainder) || error('Failed to parse dictionary key');

    remainder = r1;

    // Parse the value for this entry
    const [pdfObject, r2] =
      parseName(remainder, parseHandlers) ||
      parseDict(remainder, index, parseHandlers) ||
      parseArray(remainder, index, parseHandlers) ||
      parseString(remainder, parseHandlers) ||
      parseIndirectRef(remainder, parseHandlers) ||
      parseNumber(remainder, parseHandlers) ||
      parseHexString(remainder, parseHandlers) ||
      parseBool(remainder, parseHandlers) ||
      parseNull(remainder, parseHandlers) ||
      error('Failed to parse dictionary value');

    pdfDict.set(key, pdfObject);
    remainder = r2;
  }
  const remainderTrim = trimArray(remainder);

  // Make sure the brackets are paired
  validate(
    arrayToString(remainderTrim, 0, 2),
    isIdentity('>>'),
    'Mismatched brackets!',
  );

  remainder = trimArray(remainderTrim.subarray(2)); // Remove ending '>>' pair

  const typedDict = typeDict(pdfDict);
  if (parseHandlers.onParseDict) parseHandlers.onParseDict(typedDict);
  return [typedDict, remainder];
};

export default parseDict;
