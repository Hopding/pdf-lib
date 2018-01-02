/* @flow */
import { PDFStream, PDFName, PDFDictionary } from '../pdf-objects';
import { PDFObjectStream } from '../pdf-structures';
import parseDict from './parseDict';
import decodeStream from './encoding/decodeStream';
import parseObjectStream from './parseObjectStream';
import { error, arrayIndexOf, arrayToString, trimArray } from '../utils';

import type { ParseHandlers } from '.';

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Dictionary, followed by a PDF Stream.

If so, the dictionary is parsed and the content of the stream is extracted into
a subarray. These values (and a subarray of the input with the bytes making up
the dictionary and string removed) are returned.

If not, null is returned.
*/
const parseStream = (
  input: Uint8Array,
  parseHandlers: ParseHandlers = {},
): ?[PDFDictionary, Uint8Array, Uint8Array] => {
  // Parse the stream dictionary
  const parsedDict = parseDict(input, parseHandlers);
  if (!parsedDict) return null;
  const [dict, r] = parsedDict;

  // Check that the next bytes comprise the beginning of a stream
  const trimmed = trimArray(r);
  let startstreamIdx;
  if (arrayToString(trimmed, 0, 7) === 'stream\n') startstreamIdx = 7;
  else if (arrayToString(trimmed, 0, 8) === 'stream\r\n') startstreamIdx = 8;
  if (!startstreamIdx) return null;

  /*
  TODO: Make this more efficient by using the "Length" entry of the stream
  dictionary to jump to the end of the stream, instead of traversing each byte.
  */
  // Locate the end of the stream
  const endstreamIdx =
    arrayIndexOf(trimmed, '\nendstream') ||
    arrayIndexOf(trimmed, '\rendstream');
  if (!endstreamIdx && endstreamIdx !== 0) error('Invalid Stream!');

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

  return [dict, contents, trimmed.subarray(endstreamIdx + 10)];
};

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Stream.

If so, returns a tuple containing (1) a PDFObjectStream if it is an
Object Stream, otherwise a PDFStream and (2) a subarray of the input wih the
characters making up the parsed stream removed. The "onParseObjectStream" will
be called with the PDFObjectStream if it is an Object Stream. Otherwise
the "onParseStream" parse hander will be called.

If not, null is returned.
*/
export default (
  input: Uint8Array,
  parseHandlers: ParseHandlers = {},
): ?[PDFStream | PDFObjectStream, Uint8Array] => {
  // Parse the input bytes into the stream dictionary and content bytes
  const res = parseStream(input, parseHandlers);
  if (!res) return null;
  const [dict, contents, remaining] = res;

  // If it's an Object Stream, parse it and return the indirect objects it contains
  if (dict.get('Type') === PDFName.from('ObjStm')) {
    if (dict.get('Filter') !== PDFName.from('FlateDecode')) {
      error(`Cannot decode "${dict.get('Filter')}" Object Streams`);
    }

    const decoded = decodeStream(dict, contents);
    const objectStream = parseObjectStream(dict, decoded, parseHandlers);
    if (parseHandlers.onParseObjectStream) {
      parseHandlers.onParseObjectStream(objectStream);
    }
    return [objectStream, remaining];
  }

  // Otherwise, return a PDFStream without parsing the content bytes
  const stream = PDFStream.from(dict, contents);
  if (parseHandlers.onParseStream) parseHandlers.onParseStream(stream);
  return [stream, remaining];
};
