/* @flow */
import { PDFArray } from '../pdf-objects';
import { error, trimArray, arrayCharAt } from '../../utils';
import { validate, isIdentity } from '../../utils/validate';

import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseDict from './parseDict';

import type { ParseHandlers } from './PDFParser';

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Array.

If so, returns a tuple containing (1) an object representing the parsed PDFArray
and (2) a subarray of the input with the characters making up the parsed header
removed. The "onParseArray" parse handler will also be called with the PDFArray
object.

If not, null is returned.

Note that the elements of the PDF Array are recursively parsed, so the
appropriate parse handlers will be called when each element of the array is
parsed. The returned PDFArray's elements will be composed of PDFObjects.
*/
const parseArray = (
  input: Uint8Array,
  parseHandlers: ParseHandlers = {},
): ?[PDFArray, Uint8Array] => {
  // Make sure it is possible for this to be an array.
  const trimmed = trimArray(input);
  if (arrayCharAt(trimmed, 0) !== '[') return null;
  const pdfArray = PDFArray.fromArray([]);

  // Recursively parse each element of the array
  let remainder = trimmed.subarray(1); // Remove the '['
  while (arrayCharAt(trimArray(remainder), 0) !== ']') {
    // Parse the value for this element
    const [pdfObject, r] =
      parseName(remainder, parseHandlers) ||
      parseDict(remainder, parseHandlers) ||
      parseArray(remainder, parseHandlers) ||
      parseString(remainder, parseHandlers) ||
      parseIndirectRef(remainder, parseHandlers) ||
      parseNumber(remainder, parseHandlers) ||
      parseHexString(remainder, parseHandlers) ||
      parseBool(remainder, parseHandlers) ||
      parseNull(remainder, parseHandlers) ||
      error('Failed to parse array element');

    pdfArray.push(pdfObject);
    remainder = r;
  }
  const remainderTrim = trimArray(remainder);

  // Make sure the brackets are paired
  validate(
    arrayCharAt(remainderTrim, 0),
    isIdentity(']'),
    'Mismatched brackets!',
  );
  remainder = trimArray(remainderTrim.subarray(1)); // Remove the ']'

  if (parseHandlers.onParseArray) parseHandlers.onParseArray(pdfArray);
  return [pdfArray, remainder];
};

export default parseArray;
