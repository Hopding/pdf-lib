/* @flow */
import { PDFIndirectReference } from '../pdf-objects';
import { arrayToString, arrayIndexOf, trimArray } from 'utils';

import type { ParseHandlers } from './PDFParser';

/**
Accepts an array of bytes as input. Checks to see if the first characters in the
trimmed input make up a PDF Indirect Reference.

If so, returns a tuple containing (1) an object representing the parsed PDF
Indirect Reference and (2) a subarray of the input with the characters making up
the parsed indirect reference removed. The "onParseIndirectRef" parse handler
will also be called with the PDFIndirectReference.

If not, null is returned.
*/
const parseIndirectRef = (
  input: Uint8Array,
  { onParseIndirectRef }: ParseHandlers = {},
): ?[PDFIndirectReference, Uint8Array] => {
  const trimmed = trimArray(input);
  const indirectRefRegex = /^(\d+) (\d+) R/;

  // Check that initial characters make up an indirect reference
  const rIdx = arrayIndexOf(trimmed, 'R');
  const result = arrayToString(trimmed, 0, rIdx + 1).match(indirectRefRegex);
  if (!result) return null;

  const [fullMatch, objNum, genNum] = result;

  const ref = PDFIndirectReference.forNumbers(Number(objNum), Number(genNum));
  if (onParseIndirectRef) onParseIndirectRef(ref);
  return [ref, trimmed.subarray(fullMatch.length)];
};

export default parseIndirectRef;
