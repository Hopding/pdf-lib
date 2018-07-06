import { PDFHeader } from 'core/pdf-structures';
import { arrayCharAt, arrayIndexOf, arrayToString, trimArray } from 'utils';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in the
 * trimmed input make up a PDF Header.
 *
 * If so, returns a tuple containing (1) an object representing the parsed PDF
 * Header and (2) a subarray of the input with the characters making up the parsed
 * header removed. The "onParseHeader" parse handler will also be called with the
 * PDFHeader obect.
 *
 * If not, null is returned.
 */
const parseHeader = (
  input: Uint8Array,
  { onParseHeader }: IParseHandlers = {},
): [PDFHeader, Uint8Array] | void => {
  const trimmed = trimArray(input);
  const fileHeaderRegex = /^%PDF-(\d+)\.(\d+)/;

  // Search for first character that isn't part of a header
  let idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[%PDF-\d.]/)) idx += 1;

  // Try to match the regex up to that character to see if we've got a header
  const result = arrayToString(trimmed, 0, idx).match(fileHeaderRegex);
  if (!result) return undefined;

  const [fullMatch, major, minor] = result;
  const withoutVersion = trimArray(trimmed.subarray(fullMatch.length));
  let returnArray = withoutVersion;

  // Check for a comment with binary characters
  if (arrayCharAt(withoutVersion, 0) === '%') {
    const nextNewline = arrayIndexOf(withoutVersion, '\n')!;
    returnArray = withoutVersion.subarray(nextNewline);
  }

  const pdfHeader = PDFHeader.forVersion(Number(major), Number(minor));
  if (onParseHeader) onParseHeader(pdfHeader);
  return [pdfHeader, returnArray];
};

export default parseHeader;
