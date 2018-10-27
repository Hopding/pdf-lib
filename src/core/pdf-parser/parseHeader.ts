import { PDFHeader } from 'core/pdf-structures';
import { arrayToString, trimArray } from 'utils';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an array of bytes as input. Removes all leading bytes that do not
 * make up digits ([0-9]). Returns a subarray of the input with these leading
 * non-digit bytes removed.
 *
 * This allows us to remove the binary comment following a PDF header, before
 * proceeding to parse the rest of the document. The specification defines this
 * binary comment (section 7.5.2 File Header) as a sequence of 4 or more bytes
 * that are 128 or greater, and which are preceded by a "%".
 *
 * This would imply that to strip out this binary comment, we could check for a
 * sequence of bytes starting with "%", and remove all subsequent bytes that are
 * 128 or greater. This works for many documents that properly comply with the
 * spec. But in the wild, there are PDFs that omit the leading "%", and include
 * bytes that are less than 128 (e.g. 0 or 1). So in order to parse these
 * headers correctly, we just throw out all bytes leading up to the first digit.
 * (we assume the first digit is the object number of the first indirect object)
 */
const stripBinaryComment = (input: Uint8Array): Uint8Array => {
  let idx = 0;
  while (
    idx < input.length &&
    String.fromCharCode(input[idx]).match(/^(?![\d])./)
  ) {
    idx += 1;
  }
  return input.subarray(idx);
};

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
  const fileHeaderRegex = /^[\0\t\n\f\r ]*%PDF-(\d+)\.(\d+)[\0\t\n\f\r ]*/;

  // Search for first character that isn't part of a header
  let idx = 0;
  while (
    idx < trimmed.length &&
    String.fromCharCode(trimmed[idx]).match(/^[\0\t\n\f\r %PDF-\d.]/)
  ) {
    idx += 1;
  }

  // Try to match the regex up to that character to see if we've got a header
  const result = arrayToString(trimmed, 0, idx).match(fileHeaderRegex);
  if (!result) return undefined;

  const [fullMatch, major, minor] = result;
  const withoutVersion = trimArray(trimmed.subarray(fullMatch.length));
  const returnArray = stripBinaryComment(withoutVersion);

  const pdfHeader = PDFHeader.forVersion(Number(major), Number(minor));
  if (onParseHeader) onParseHeader(pdfHeader);
  return [pdfHeader, returnArray];
};

export default parseHeader;
