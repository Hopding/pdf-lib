import { arrayToString, trimArray, arrayCharAt } from '../utils';

const parseString = (input, parseHandlers={}) => {
  const trimmed = trimArray(input);
  if (arrayCharAt(trimmed, 0) !== '(') return null;

  const parensStack = [];
  let isEscaped = false;
  for(let idx = 0; idx < trimmed.length; idx++) {
    const c = arrayCharAt(trimmed, idx);
    // Check for unescaped parenthesis
    if (!isEscaped) {
      if (c === '(') parensStack.push(c);
      else if (c === ')') parensStack.pop();
    }

    // Track whether current character is being escaped or not
    if (c === '\\') {
      if (!isEscaped)
        isEscaped = true;
      else
        isEscaped = false;
    }
    else if (isEscaped) isEscaped = false;

    // Once (if) the unescaped parenthesis balance out, return their contents
    if (parensStack.length === 0) {
      const { onParseString=() => {} } = parseHandlers;
      const str = arrayToString(trimmed, 1, idx);
      return [onParseString(str) || str, trimmed.subarray(idx + 1)];
    }
  }
  return null; // Parenthesis didn't balance out
}

export default parseString;
