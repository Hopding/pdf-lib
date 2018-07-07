import { PDFIndirectObject, PDFStream } from 'core/pdf-objects';
import {
  PDFLinearizationParams,
  PDFTrailer,
  PDFXRef,
} from 'core/pdf-structures';
import { error, trimArray } from 'utils';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import parseIndirectObj from './parseIndirectObj';
import { parseTrailer, parseTrailerWithoutDict } from './parseTrailer';
import parseXRefTable from './parseXRefTable';

import { IParseHandlers } from './PDFParser';

export interface IPDFLinearization {
  paramDict: PDFIndirectObject<PDFLinearizationParams>;
  xref: typeof PDFXRef.Table | PDFIndirectObject<PDFStream>;
  trailer?: PDFTrailer;
}

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in the
 * trimmed input make up a PDF Linearization Param Dict, followed by an xref table
 * or stream, and finally a trailer.
 *
 * If so, returns a tuple containing (1) an object representing those three objects
 * and (2) a subarray of the input with the characters making up the parsed objects
 * removed. The "onParseDict" parse handler will be called with the linearization
 * param dict. The "onParseLinearization" parse handler will also be called with
 * objects representing the three parsed linearization objects.
 *
 * If not, null is returned.
 */
const parseLinearization = (
  input: Uint8Array,
  index: PDFObjectIndex,
  parseHandlers: IParseHandlers = {},
): [IPDFLinearization, Uint8Array] | void => {
  const trimmed = trimArray(input);

  // Try to parse a dictionary from the input
  const paramDictMatch = parseIndirectObj(trimmed, index, parseHandlers);
  if (!paramDictMatch) return undefined;

  // Make sure it is a Linearization Param Dictionary
  const [paramDict, remaining1] = paramDictMatch as [
    PDFIndirectObject<PDFLinearizationParams>,
    Uint8Array
  ];
  if (!(paramDict.pdfObject instanceof PDFLinearizationParams)) {
    return undefined;
  }

  // TODO: Do the parseHandlers really need to be passed to parseIndirectObj?
  // Next we should find a cross reference stream or xref table
  const xrefMatch =
    parseXRefTable(remaining1) ||
    parseIndirectObj(remaining1, index, parseHandlers) ||
    error(
      'Found Linearization param dict but no first page xref table or stream.',
    );

  const [xref, remaining2] = xrefMatch as [
    typeof PDFXRef.Table | PDFIndirectObject<PDFStream>,
    Uint8Array
  ];

  const trailerMatch =
    parseTrailer(remaining2, index) ||
    parseTrailerWithoutDict(remaining2, index);

  // Per the PDF spec, a trailer should always be present - but some PDFs in the
  // wild are missing them anyways
  if (!trailerMatch) {
    console.warn(
      'Found Linearization param dict and cross reference index, but no associated trailer.',
    );
  }

  const [trailer, remaining3] = trailerMatch || [undefined, undefined];

  const linearization = { paramDict, xref, trailer };
  if (parseHandlers.onParseLinearization) {
    parseHandlers.onParseLinearization(linearization);
  }
  return [linearization, remaining3 || remaining2];
};

export default parseLinearization;
