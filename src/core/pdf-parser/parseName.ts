import { PDFName } from 'core/pdf-objects';
import { arrayToString, trimArray } from 'utils';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in the
 * trimmed input make up a PDF Name.
 *
 * If so, returns a tuple containing (1) an object representing the parsed PDF Name
 * and (2) a subarray of the input with the characters making up the parsed name
 * removed. The "onParseName" parse handler will also be called with the PDFName
 * object.
 *
 * If not, null is returned.
 */
const parseName = (
  input: Uint8Array,
  { onParseName }: IParseHandlers = {},
): [PDFName, Uint8Array] | void => {
  const trimmed = trimArray(input);
  const nameRegex = /^\/([^ \n\r\][<>(/]*)/;

  // Search for first character that isn't part of a name
  let idx = 1; // Skip the leading '/'
  while (
    trimmed[idx] !== undefined &&
    String.fromCharCode(trimmed[idx]).match(/^[^ \n\r\][<>(/]/)
  ) {
    idx += 1;
  }

  // Try to match the regex up to that character to see if we've got a name
  const result = arrayToString(trimmed, 0, idx).match(nameRegex);
  if (!result) return undefined;

  const [fullMatch, name] = result;

  const pdfName = PDFName.from(name);
  if (onParseName) onParseName(pdfName);
  return [pdfName, trimmed.subarray(fullMatch.length)];
};

export default parseName;
