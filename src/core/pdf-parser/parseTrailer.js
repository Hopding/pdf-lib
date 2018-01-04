/* @flow */
import { PDFDictionary } from '../pdf-objects';
import { PDFTrailer } from '../pdf-structures';
import {
  error,
  arrayToString,
  trimArray,
  arrayIndexOf,
  charCode,
} from '../../utils';
import parseDict from './parseDict';
import parseNumber from './parseNumber';

import type { ParseHandlers } from './PDFParser';

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Trailer.

If so, returns a tuple containing (1) an object representing the parsed PDF
Trailer and (2) a subarray of the input with the characters making up the parsed
trailer removed. The "onParseTrailer" parse handler will be called with the
PDFTrailer object. The "onParseDict" parse handler will be called with the
dictionary of the PDFTrailer, and the "onParseNumber" parse handler will be
called with the "lastXRefOffset" of the PDFTrailer.

If not, null is returned.
*/
const parseTrailer = (
  input: Uint8Array,
  parseHandlers: ParseHandlers = {},
): ?[PDFTrailer, Uint8Array] => {
  const trimmed = trimArray(input);
  const trailerRegex = /^trailer[\n|\r| ]*([^]+)startxref[\n|\r| ]+?(\d+)[\n|\r| ]+?%%EOF/;

  // Find the nearest "%%EOF" of the input and match the regex up to that index
  const eofIdx = arrayIndexOf(trimmed, '%%EOF');
  const result = arrayToString(trimmed, 0, eofIdx + 5).match(trailerRegex);
  if (!result) return null;

  const [fullMatch, dictStr, lastXRefOffsetStr] = result;

  // Parse the dictionary string into a PDFDictionary
  const dictBytes = new Uint8Array(dictStr.split('').map(charCode));
  const [dict] =
    parseDict(dictBytes, parseHandlers) ||
    error('Failed to parse trailer dictionary');

  // Parse the xref offset string value into a PDFNumber
  const offsetBytes = new Uint8Array(lastXRefOffsetStr.split('').map(charCode));
  const [lastXRefOffset] =
    parseNumber(offsetBytes, parseHandlers) ||
    error('Failed to parse lastXRefOffset of trailer');

  const trailer = PDFTrailer.from(lastXRefOffset.number, dict);
  if (parseHandlers.onParseTrailer) parseHandlers.onParseTrailer(trailer);
  return [trailer, trimmed.subarray(fullMatch.length)];
};

/**
Same as "parseTrailer" function, except does not look for the complete trailer.
Specifically, the "trailer" keyword and the trailer's dictionary are not parsed.

Documents that have such a trailer do not meet the official specification, but
they do appear in the wild sometimes. This function allows us to handle them.
*/
const parseMalformattedTrailer = (
  input: Uint8Array,
  parseHandlers: ParseHandlers = {},
): ?[PDFTrailer, Uint8Array] => {
  const trimmed = trimArray(input);
  const trailerRegex = /^startxref[\n|\r| ]+?(\d+)[\n|\r| ]+?%%EOF/;

  // Find the nearest "%%EOF" of the input and match the regex up to that index
  const eofIdx = arrayIndexOf(trimmed, '%%EOF');
  const result = arrayToString(trimmed, 0, eofIdx + 5).match(trailerRegex);
  if (!result) return null;

  const [fullMatch, lastXRefOffsetStr] = result;

  // Parse the xref offset string value into a PDFNumber
  const offsetBytes = new Uint8Array(lastXRefOffsetStr.split('').map(charCode));
  const [lastXRefOffset] =
    parseNumber(offsetBytes, parseHandlers) ||
    error('Failed to parse lastXRefOffset of trailer');

  const trailer = PDFTrailer.from(
    lastXRefOffset.number,
    PDFDictionary.from({}),
  );
  if (parseHandlers.onParseTrailer) parseHandlers.onParseTrailer(trailer);
  return [trailer, trimmed.subarray(fullMatch.length)];
};

export { parseTrailer, parseMalformattedTrailer };
