import StringView from '../StringView';
// const parseNull = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//   const result = trimmed.match(`^null`);
//   if (!result) return null;
//
//   const { onParseNull=() => {} } = parseHandlers;
//   return {
//     pdfObject: onParseNull(null) || null,
//     remainder: trimmed.substring(4),
//   };
// }

const parseNull = (input, startIdx, parseHandlers={}) => {
  const sv = (new StringView(input)).subview(startIdx);
  const result = sv.match(/^(?:[\ |\n]*)null/);
  if (!result) return null;

  const [fullMatch] = result;
  const { onParseNull=() => {} } = parseHandlers;
  return [onParseNull(null) || null, startIdx + fullMatch.length];
}

export default parseNull;
