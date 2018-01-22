/* @flow */
import { PDFStream, PDFIndirectObject } from 'core/pdf-objects';
import {
  PDFTrailer,
  PDFLinearizationParams,
  PDFXRef,
} from 'core/pdf-structures';
import { error, trimArray } from 'utils';

import type { PDFObjectLookup } from 'core/pdf-document/PDFObjectIndex';

import parseXRefTable from './parseXRefTable';
import parseIndirectObj from './parseIndirectObj';
import { parseTrailer, parseTrailerWithoutDict } from './parseTrailer';

import type { ParseHandlers } from './PDFParser';

export type PDFLinearization = {
  paramDict: PDFIndirectObject<PDFLinearizationParams>,
  xref: PDFXRef.Table | PDFIndirectObject<PDFStream>,
  trailer: ?PDFTrailer,
};

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Linearization Param Dict, followed by an xref table
or stream, and finally a trailer.

If so, returns a tuple containing (1) an object representing those three objects
and (2) a subarray of the input with the characters making up the parsed objects
removed. The "onParseDict" parse handler will be called with the linearization
param dict. The "onParseLinearization" parse handler will also be called with
objects representing the three parsed linearization objects.

If not, null is returned.
*/
const parseLinearization = (
  input: Uint8Array,
  lookup: PDFObjectLookup,
  parseHandlers: ParseHandlers = {},
): ?[PDFLinearization, Uint8Array] => {
  const trimmed = trimArray(input);

  // Try to parse a dictionary from the input
  const paramDictMatch = parseIndirectObj(trimmed, lookup, parseHandlers);
  if (!paramDictMatch) return null;

  // Make sure it is a Linearization Param Dictionary
  const [paramDict, remaining1] = paramDictMatch;
  if (!paramDict.pdfObject.is(PDFLinearizationParams)) return null;

  // TODO: Do the parseHandlers really need to be passed to parseIndirectObj?
  // Next we should find a cross reference stream or xref table
  const xrefMatch =
    parseXRefTable(remaining1) ||
    parseIndirectObj(remaining1, lookup, parseHandlers) ||
    error(
      'Found Linearization param dict but no first page xref table or stream.',
    );

  const [xref, remaining2] = xrefMatch;

  const trailerMatch =
    parseTrailer(remaining2, lookup) ||
    parseTrailerWithoutDict(remaining2, lookup);

  // Per the PDF spec, a trailer should always be present - but some PDFs in the
  // wild are missing them anyways
  if (!trailerMatch) {
    console.warn(
      'Found Linearization param dict and cross reference index, but no associated trailer.',
    );
  }

  const [trailer, remaining3] = trailerMatch || [];

  const linearization = { paramDict, xref, trailer };
  if (parseHandlers.onParseLinearization) {
    parseHandlers.onParseLinearization(linearization);
  }
  return [linearization, remaining3 || remaining2];
};

export default parseLinearization;
