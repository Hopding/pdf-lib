import StringView from '../StringView';

// const parseBool = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//   const boolRegex = /^(true|false)(?=\ |\]|\n)/;
//   const result = trimmed.match(boolRegex);
//   if (!result) return null;
//
//   const [fullMatch, bool] = result;
//   const { onParseBool=() => {} } = parseHandlers;
//   return {
//     pdfObject: onParseBool(bool) || bool === 'true' ? true : false,
//     remainder: trimmed.substring(fullMatch.length).trim()
//   }
// }

const parseBool = (input, startIdx, parseHandlers={}) => {
  const sv = (new StringView(input)).subview(startIdx);
  const boolRegex = /^(?:[\ |\n]*)(true|false)(?=\ |\]|\n)/;
  const result = sv.match(boolRegex);
  if (!result) return null;

  const [fullMatch, bool] = result;
  const { onParseBool=() => {} } = parseHandlers;
  // return {
  //   pdfObject: onParseBool(bool) || bool === 'true' ? true : false,
  //   remainder: trimmed.substring(fullMatch.length).trim()
  // }
  return [onParseBool(bool) || bool === 'true' ? true : false, startIdx + fullMatch.length];
}

export default parseBool;
