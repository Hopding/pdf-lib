/* @flow */
import { PDFStream, PDFIndirectObject } from '../pdf-objects';
import { PDFTrailer, PDFLinearizationParams, PDFXRef } from '../pdf-structures';
import { error, trimArray } from '../../utils';

import parseXRefTable from './parseXRefTable';
import parseIndirectObj from './parseIndirectObj';
import { parseTrailer, parseMalformattedTrailer } from './parseTrailer';

import type { ParseHandlers } from './PDFParser';

export type PDFLinearization = {
  paramDict: PDFIndirectObject<PDFLinearizationParams>,
  xref: PDFXRef.Table | PDFIndirectObject<PDFStream>,
  trailer: PDFTrailer,
};

const parseLinearization = (
  input: Uint8Array,
  parseHandlers: ParseHandlers = {},
): ?[PDFLinearization, Uint8Array] => {
  const trimmed = trimArray(input);

  const paramDictMatch = parseIndirectObj(trimmed, parseHandlers);
  if (!paramDictMatch) return null;

  const [paramDict, remaining1] = paramDictMatch;
  if (!paramDict.pdfObject.is(PDFLinearizationParams)) return null;

  // Now a cross reference stream or xref table
  const xrefMatch =
    parseXRefTable(remaining1) ||
    parseIndirectObj(remaining1, parseHandlers) ||
    error(
      'Found Linearization param dict but no first page xref table or stream.',
    );

  const [xref, remaining2] = xrefMatch;

  const trailerMatch =
    parseTrailer(remaining2) || parseMalformattedTrailer(remaining2);

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
