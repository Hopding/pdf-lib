import StringView from '../StringView';

// const parseString = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//   if (trimmed.charAt(0) !== '(') return null;
//
//   const parensStack = [];
//   let isEscaped = false;
//   for(let idx = 0; idx < trimmed.length; idx++) {
//     const c = trimmed.charAt(idx);
//     // Check for unescaped parenthesis
//     if (!isEscaped) {
//       if (c === '(') parensStack.push(c);
//       else if (c === ')') parensStack.pop();
//     }
//
//     // Track whether current character is being escaped or not
//     if (c === '\\') {
//       if (!isEscaped)
//         isEscaped = true;
//       else
//         isEscaped = false;
//     }
//     else if (isEscaped) isEscaped = false;
//
//     // Once (if) the unescaped parenthesis balance out, return their contents
//     if (parensStack.length === 0) {
//       const { onParseString=() => {} } = parseHandlers;
//       const str = trimmed.substring(1, idx);
//       return {
//         pdfObject: onParseString(str) || str,
//         remainder: trimmed.substring(idx + 1).trim(),
//       };
//     }
//   }
//   return null; // Parenthesis didn't balance out
// }

const parseString = (input, startIdx, parseHandlers={}) => {
  const inputStr = (new StringView(input)).subview(startIdx).toString();
  const trimmed = inputStr.trim();
  if (trimmed.charAt(0) !== '(') return null;

  const parensStack = [];
  let isEscaped = false;
  for(let idx = 0; idx < trimmed.length; idx++) {
    const c = trimmed.charAt(idx);
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
      const str = trimmed.substring(1, idx);
      // return {
      //   pdfObject: onParseString(str) || str,
      //   remainder: trimmed.substring(idx + 1).trim(),
      // };
      return [onParseString(str) || str, startIdx + inputStr.indexOf('(') + 1 + idx];
    }
  }
  return null; // Parenthesis didn't balance out
}

export default parseString;
