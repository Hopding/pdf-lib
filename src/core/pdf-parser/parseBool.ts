import { PDFBoolean } from 'core/pdf-objects';
import { arrayToString } from 'utils';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in
 * the trimmed input make up a PDF Boolean.
 *
 * If so, returns a tuple containing (1) an object representing the parsed
 * PDF Boolean and (2) a subarray of the input with the characters making up the
 * parsed header removed. The "onParseBool" parse handler will also be called
 * with the PDFBoolean object.
 *
 * If not, null is returned.
 */
const parseBool = (
  input: Uint8Array,
  { onParseBool }: IParseHandlers = {},
): [PDFBoolean, Uint8Array] | void => {
  const boolRegex = /^(?:[\n|\r| ]*)(true|false)((?= |\]|\n|\r))?/;

  // Search for first character that isn't part of a boolean
  let idx = 0;
  while (String.fromCharCode(input[idx]).match(/^[ \n\rtruefalse]/)) idx += 1;

  // Try to match the regex up to that character to see if we've got a boolean
  const result = arrayToString(input, 0, idx).match(boolRegex);
  if (!result) return undefined;

  const [fullMatch, bool] = result;

  const pdfBool = PDFBoolean.fromString(bool);
  if (onParseBool) onParseBool(pdfBool);
  return [pdfBool, input.subarray(fullMatch.length)];
};

export default parseBool;
