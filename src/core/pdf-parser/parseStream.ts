import {
  PDFDictionary,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFRawStream,
  PDFArray,
} from 'core/pdf-objects';
import { PDFObjectStream } from 'core/pdf-structures';
import {
  arrayIndexOf,
  arrayIndexOneOf,
  arrayToString,
  error,
  trimArrayAndRemoveComments,
} from 'utils';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import decodeStream from './encoding/decodeStream';
import parseObjectStream from './parseObjectStream';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an array of bytes and a PDFDictionary as input. Checks to see if the
 * first characters in the trimmed input make up a PDF Stream.
 *
 * If so, the content of the stream is extracted into a subarray. A tuple
 * containing this content subarray and a subarray of the input with the bytes making
 * up the entire stream removed is returned.
 *
 * If not, null is returned.
 */
const parseStream = (
  input: Uint8Array,
  dict: PDFDictionary,
  parseHandlers: IParseHandlers = {},
): [Uint8Array, Uint8Array] | void => {
  // Check that the next bytes comprise the beginning of a stream
  const trimmed = trimArrayAndRemoveComments(input);

  // The first two cases we check for are valid according to the PDF spec
  // ('stream\n' and 'stream\r\n') but the third ('stream\r') is not:
  //   > The keyword stream that follows the stream dictionary shall be followed
  //   > by an end-of-line marker consisting of either a CARRIAGE RETURN and a
  //   > LINE FEED or just a LINE FEED, **and not by a CARRIAGE RETURN alone.**
  // However, some PDFs in the wild only use carriage returns, so we have to
  // check for them here in the third case.
  let startstreamIdx;
  if (arrayToString(trimmed, 0, 7) === 'stream\n') startstreamIdx = 7;
  else if (arrayToString(trimmed, 0, 8) === 'stream\r\n') startstreamIdx = 8;
  else if (arrayToString(trimmed, 0, 7) === 'stream\r') startstreamIdx = 7;
  if (!startstreamIdx) return undefined;

  /* ===================== Try to find the stream's end ===================== */
  const Length = dict.getMaybe<PDFIndirectReference | PDFNumber>('Length');

  let endstreamMatchTuple: [number, string] | void;
  const endstreamKeywords = ['\nendstream', '\rendstream', 'endstream'];

  // TODO: Enhance parser to support indirect Length references. Right now this
  //       only works if the Length entry is a direct number.

  // Try to use the Length entry to find the end of the stream
  if (Length && Length instanceof PDFNumber) {
    const startAt = Length.number + startstreamIdx;
    const maybeTuple = arrayIndexOneOf(trimmed, endstreamKeywords, startAt);
    if (maybeTuple && maybeTuple[0] === startAt + 1) {
      endstreamMatchTuple = maybeTuple;
    }
  }

  // If the Length entry isn't present, is an indirect reference, or is
  // an invalid value, then we'll try to find the end of the stream by brute
  // force. We'll scan each byte from the start of the stream until we find
  // the `endstream` keyword.
  if (!endstreamMatchTuple) {
    const maybeTuple = arrayIndexOneOf(trimmed, endstreamKeywords, 0);
    if (maybeTuple) endstreamMatchTuple = maybeTuple;
  }
  /* ======================================================================== */

  if (!endstreamMatchTuple) throw new Error('Invalid Stream!');
  const [endstreamIdx, endstreamMatch] = endstreamMatchTuple;

  /*
  TODO: See if it makes sense to .slice() the stream contents, even though this
  would require more memory space.
  */
  // Extract the stream content bytes
  const contents = trimmed.subarray(startstreamIdx, endstreamIdx);

  // Verify that the next characters denote the end of the stream
  const endobjIdx = arrayIndexOf(trimmed, 'endobj', endstreamIdx);
  if (arrayToString(trimmed, endstreamIdx, endobjIdx).trim() !== 'endstream') {
    error('Invalid Stream!');
  }

  return [contents, trimmed.subarray(endstreamIdx + endstreamMatch.length)];
};

/**
 * Accepts an array of bytes and a PDFDictionary as input. Checks to see if the
 * first characters in the trimmed input make up a PDF Stream.
 *
 * If so, returns a tuple containing (1) a PDFObjectStream if it is an
 * Object Stream, otherwise a PDFStream and (2) a subarray of the input wih the
 * characters making up the parsed stream removed. The "onParseObjectStream" will
 * be called with the PDFObjectStream if it is an Object Stream. Otherwise
 * the "onParseStream" parse hander will be called.
 *
 * If not, null is returned.
 */
export default (
  input: Uint8Array,
  dict: PDFDictionary,
  index: PDFObjectIndex,
  parseHandlers: IParseHandlers = {},
): [PDFRawStream | PDFObjectStream, Uint8Array] | void => {
  // Parse the input bytes into the stream dictionary and content bytes
  const res = parseStream(input, dict, parseHandlers);
  if (!res) return undefined;
  const [contents, remaining] = res;

  // If it's an Object Stream, parse it and return the indirect objects it contains
  if (dict.getMaybe('Type') === PDFName.from('ObjStm')) {
    if (dict.getMaybe('Filter') !== PDFName.from('FlateDecode') &&  !(dict.getMaybe('Filter') instanceof PDFArray && (dict.getMaybe('Filter') as PDFArray).get(0) === PDFName.from('FlateDecode'))) {
      error(`Cannot decode "${dict.get('Filter')}" Object Streams`);
    }

    const decoded = decodeStream(dict, contents);
    const objectStream = parseObjectStream(dict, decoded, index, parseHandlers);
    if (parseHandlers.onParseObjectStream) {
      parseHandlers.onParseObjectStream(objectStream);
    }
    return [objectStream, remaining];
  }

  // Otherwise, return a PDFStream without parsing the content bytes
  const stream = PDFRawStream.from(dict, contents);
  if (parseHandlers.onParseStream) parseHandlers.onParseStream(stream);
  return [stream, remaining];
};
