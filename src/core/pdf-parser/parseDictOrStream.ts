/* @flow */
import { PDFDictionary, PDFStream } from 'core/pdf-objects';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import parseStream from './parseStream';
import parseDict from './parseDict';

import { ParseHandlers } from './PDFParser';

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Dictionary. Then checks if the subsequent characters
make up a PDF Stream.

If a PDFDictionary is found, but no PDFStream, then the dictionary is returned.
If a PDFStream is also found, then it is instead returned. The second argument
of the returned tuple contains a subarray of the input with the characters
making up the parsed object removed.

If no PDFDictionary is found at all, null is returned.
*/
const parseDictOrStream = (
  input: Uint8Array,
  index: PDFObjectIndex,
  parseHandlers: ParseHandlers = {},
): ?[PDFDictionary | PDFStream, Uint8Array] => {
  // Attempt to parse a dictionary
  const dictMatch = parseDict(input, index, parseHandlers);
  if (!dictMatch) return null;
  const [dict, r] = dictMatch;

  // Attempt to parse a stream next
  const streamMatch = parseStream(r, dict, index, parseHandlers);

  // Return stream if one was parsed, otherwise return the dictionary
  if (streamMatch) return streamMatch;
  return [dict, r];
};

export default parseDictOrStream;
