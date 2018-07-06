/* eslint-disable no-constant-condition */
import { error } from 'utils';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import parseHeader from './parseHeader';
import parseIndirectObj from './parseIndirectObj';
import parseLinearization from './parseLinearization';
import { parseTrailer, parseTrailerWithoutDict } from './parseTrailer';
import parseXRefTable from './parseXRefTable';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an array of bytes as input. Parses indirect objects from the input bytes
 * until an xref table or trailer is found. The "onParseIndirectObj" parse
 * handler is called with each indirect object that is parsed.
 *
 * Returns a subarray of the input bytes with the bytes making up the parsed
 * indirect objects removed.
 */
const parseBodySection = (
  input: Uint8Array,
  index: PDFObjectIndex,
  parseHandlers: IParseHandlers,
): Uint8Array => {
  let remainder = input;
  while (true) {
    const result = parseIndirectObj(remainder, index, parseHandlers);
    if (!result) break;
    [, remainder] = result;
  }
  return remainder;
};

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in the
 * input make up an xref table followed by a trailer, or just a trailer. The
 * "onParseXRefTable" and "onParseTrailer" parseHandlers will be called with the
 * parsed objects.
 *
 * Returns a subarray of the input bytes with the bytes making up the parsed
 * objects removed.
 */
const parseFooterSection = (
  input: Uint8Array,
  index: PDFObjectIndex,
  parseHandlers: IParseHandlers,
): Uint8Array | void => {
  let remainder = input;

  // Try to parse the XRef table (some PDFs omit the XRef table)
  const parsedXRef = parseXRefTable(input, parseHandlers);
  if (parsedXRef) [, remainder] = parsedXRef;

  // Try to parse the trailer with and without dictionary, because some
  // malformatted documents are missing the dictionary.
  const parsedTrailer =
    parseTrailer(remainder, index, parseHandlers) ||
    parseTrailerWithoutDict(remainder, index, parseHandlers);
  if (!parsedTrailer) return undefined;

  [, remainder] = parsedTrailer;
  return remainder;
};

/**
 * Accepts an array of bytes comprising a PDF document as input. Parses all the
 * objects in the file in a sequential fashion, beginning with the header and
 * ending with the last trailer.
 *
 * The XRef tables/streams in the input are not used to locate and parse objects
 * as needed. Rather, the whole document is parsed and stored in memory at once.
 */
const parseDocument = (
  input: Uint8Array,
  index: PDFObjectIndex,
  parseHandlers: IParseHandlers,
): void => {
  // TODO: Figure out way to clean comments without messing stream content up
  // const cleaned = removeComments(input);
  const cleaned = input;

  // Parse the document header
  let remainder: Uint8Array | void;
  [, remainder] =
    parseHeader(cleaned, parseHandlers) || error('PDF is missing a header');

  // If document is linearized, we'll need to parse the linearization
  // dictionary and First-Page XRef table/stream next...
  const linearizationMatch = parseLinearization(
    remainder,
    index,
    parseHandlers,
  );
  if (linearizationMatch) [, remainder] = linearizationMatch;

  // Parse each body of the document and its corresponding footer.
  // (if document does not have update sections, loop will only occur once)
  while (remainder) {
    remainder = parseBodySection(remainder, index, parseHandlers);
    remainder = parseFooterSection(remainder, index, parseHandlers);
  }
};

export default parseDocument;
