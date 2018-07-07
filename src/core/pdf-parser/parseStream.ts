import { PDFDictionary, PDFName, PDFRawStream } from 'core/pdf-objects';
import { PDFObjectStream } from 'core/pdf-structures';
import {
  arrayIndexOf,
  arrayIndexOneOf,
  arrayToString,
  error,
  trimArray,
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
  const trimmed = trimArray(input);

  let startstreamIdx;
  if (arrayToString(trimmed, 0, 7) === 'stream\n') startstreamIdx = 7;
  else if (arrayToString(trimmed, 0, 8) === 'stream\r\n') startstreamIdx = 8;
  if (!startstreamIdx) return undefined;

  /*
  TODO: Make this more efficient by using the "Length" entry of the stream
  dictionary to jump to the end of the stream, instead of traversing each byte.
  */
  // Locate the end of the stream
  const endstreamMatchTuple = arrayIndexOneOf(trimmed, [
    '\nendstream',
    '\rendstream',
    'endstream',
  ]);
  if (!endstreamMatchTuple) error('Invalid Stream!');
  const [endstreamIdx, endstreamMatch] = endstreamMatchTuple!;

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
    if (dict.getMaybe('Filter') !== PDFName.from('FlateDecode')) {
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
