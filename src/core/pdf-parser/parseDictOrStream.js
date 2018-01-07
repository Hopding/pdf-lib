/* @flow */
import { PDFDictionary, PDFStream } from '../pdf-objects';

import parseStream from './parseStream';
import parseDict from './parseDict';

import type { ParseHandlers } from './PDFParser';

const parseDictOrStream = (
  input: Uint8Array,
  parseHandlers: ParseHandlers = {},
): ?[PDFDictionary | PDFStream, Uint8Array] => {
  // Attempt to parse a dictionary
  const dictMatch = parseDict(input, parseHandlers);
  if (!dictMatch) return null;
  const [dict, r] = dictMatch;

  // Attempt to parse a stream next
  const streamMatch = parseStream(r, dict, parseHandlers);

  // Return stream if one was parsed, otherwise return the dictionary
  if (streamMatch) return streamMatch;
  return [dict, r];
};

export default parseDictOrStream;
