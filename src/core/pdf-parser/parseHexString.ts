import { PDFHexString } from 'core/pdf-objects';
import { arrayToString, charFromCode, trimArray } from 'utils';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in the
 * trimmed input make up a PDF Hex String.
 *
 * If so, returns a tuple containing (1) an object representing the parsed PDF Hex
 * String and (2) a subarray of the input with the characters making up the parsed
 * hex string removed. The "onParseHexString" parse handle will also be called with
 * the PDFHexString object.
 *
 * If not, null is returned.
 */
const parseHexString = (
  input: Uint8Array,
  { onParseHexString }: IParseHandlers = {},
): [PDFHexString, Uint8Array] | void => {
  const hexStringRegex = /^<([\dABCDEFabcdef\0\t\n\f\r ]*)>/;
  const trimmed = trimArray(input);
  if (trimmed.length === 0) return undefined;

  // Search for first character that isn't part of a hex string
  let idx = 0;
  while (charFromCode(trimmed[idx]).match(/^[<(\dABCDEFabcdef\0\t\n\f\r ]/)) {
    idx += 1;
  }

  // Try to match the regex up to that character to see if we've got a hex string
  const result = arrayToString(trimmed, 0, idx + 2).match(hexStringRegex);
  if (!result) return undefined;

  const [fullMatch, hexString] = result;

  const pdfHexString = PDFHexString.fromString(hexString);
  if (onParseHexString) onParseHexString(pdfHexString);
  return [pdfHexString, trimmed.subarray(fullMatch.length)];
};

export default parseHexString;
