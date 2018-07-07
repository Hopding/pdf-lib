import { PDFString } from 'core/pdf-objects';
import { arrayCharAt, arrayToString, trimArray } from 'utils';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts an array of bytes as input. Checks to see if the first characters in the
 * trimmed input make up a PDF String.
 *
 * If so, returns a tuple containing (1) an object representing the parsed PDF
 * String and (2) a subarray of the input with the characters making up the parsed
 * string removed. The "onParseString" parse handler will also be called with the
 * PDFString object.
 *
 * If not, returns null.
 */
const parseString = (
  input: Uint8Array,
  { onParseString }: IParseHandlers = {},
): [PDFString, Uint8Array] | void => {
  const trimmed = trimArray(input);
  if (arrayCharAt(trimmed, 0) !== '(') return undefined;

  const parensStack = [];
  let isEscaped = false;
  for (let idx = 0; idx < trimmed.length; idx += 1) {
    const c = arrayCharAt(trimmed, idx);
    // Check for unescaped parenthesis
    if (!isEscaped) {
      if (c === '(') parensStack.push(c);
      else if (c === ')') parensStack.pop();
    }

    // Track whether current character is being escaped or not
    if (c === '\\') {
      if (!isEscaped) {
        isEscaped = true;
      } else {
        isEscaped = false;
      }
    } else if (isEscaped) isEscaped = false;

    // Once (if) the unescaped parenthesis balance out, return their contents
    if (parensStack.length === 0) {
      const str = arrayToString(trimmed, 1, idx);
      const pdfString = PDFString.fromString(str);
      if (onParseString) onParseString(pdfString);
      return [pdfString, trimmed.subarray(idx + 1)];
    }
  }
  return undefined; // Parenthesis didn't balance out
};

export default parseString;
