import { PDFNumber } from 'core/pdf-objects';
import { arrayToString, trimArray } from 'utils';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in the
 * trimmed input make up a PDF Number.
 *
 * If so, returns a tuple containing (1) an object representing the parsed PDF
 * Number and (2) a subarray of the input with the characters making up the parsed
 * number removed. The "onParseNumber" parse handler will also be called with the
 * parsed PDFNumber object.
 *
 * If not, null is returned.
 */
const parseNumber = (
  input: Uint8Array,
  { onParseNumber }: IParseHandlers = {},
): [PDFNumber, Uint8Array] | void => {
  const trimmed = trimArray(input);
  const numRegex = /^(((\+{1}|-{1})?\d+(\.\d+)?)|((\+{1}|-{1})?\.\d+))/;

  // Search for the first character that isn't part of a number
  let idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[+-.\d]/)) idx += 1;

  // Try to match the regex up to that character to see if we've got a number
  const result = arrayToString(trimmed, 0, idx).match(numRegex);
  if (!result) return undefined;

  const [fullMatch, num] = result;

  const pdfNumber = PDFNumber.fromString(num);
  if (onParseNumber) onParseNumber(pdfNumber);
  return [pdfNumber, trimmed.subarray(fullMatch.length)];
};

export default parseNumber;
