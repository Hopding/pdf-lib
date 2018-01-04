/* @flow */
/* eslint-disable no-constant-condition */
import parseHeader from './parseHeader';
import parseLinearization from './parseLinearization';
import parseIndirectObj from './parseIndirectObj';
import parseXRefTable from './parseXRefTable';
import { parseTrailer, parseMalformattedTrailer } from './parseTrailer';
// import removeComments from './removeComments';
import { error } from '../../utils';

import type { ParseHandlers } from './PDFParser';

const parseBodySection = (
  input: Uint8Array,
  parseHandlers: ParseHandlers,
): Uint8Array => {
  let remainder = input;
  while (true) {
    const result = parseIndirectObj(remainder, parseHandlers);
    if (!result) break;
    [, remainder] = result;
  }
  return remainder;
};

const parseFooterSection = (
  input: Uint8Array,
  parseHandlers: ParseHandlers,
): ?Uint8Array => {
  let remainder = input;

  // Try to parse the XRef table (some PDFs omit the XRef table)
  const parsedXRef = parseXRefTable(input, parseHandlers);
  if (parsedXRef) [, remainder] = parsedXRef;

  // Try to parse the trailer with and without dictionary, because some
  // malformatted documents are missing the dictionary.
  const parsedTrailer =
    parseTrailer(remainder, parseHandlers) ||
    parseMalformattedTrailer(remainder, parseHandlers);
  if (!parsedTrailer) return null;

  [, remainder] = parsedTrailer;
  return remainder;
};

const parseDocument = (
  input: Uint8Array,
  parseHandlers: ParseHandlers,
): void => {
  console.log('parsing document');

  // TODO: Figure out way to clean comments without stream content messing it up
  // const cleaned = removeComments(input);

  const cleaned = input;
  let [, remainder] =
    parseHeader(cleaned, parseHandlers) || error('PDF is missing a header');

  // If document is linearized, we'll need to parse the linearization
  // dictionary and First-Page XRef table next...
  const linearizationMatch = parseLinearization(remainder, parseHandlers);
  if (linearizationMatch) [, remainder] = linearizationMatch;

  while (remainder) {
    remainder = parseBodySection(remainder, parseHandlers);
    remainder = parseFooterSection(remainder, parseHandlers);
  }

  console.log('done');
};

export default parseDocument;
