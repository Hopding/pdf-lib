import StringView from '../StringView';

// const parseName = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//   const nameRegex = /^\/([^\ \]\n]+)(?=\ |\]|\n)/;
//   const result = trimmed.match(nameRegex);
//   if (!result) return null;
//
//   const [fullMatch, name] = result;
//   const { onParseName=() => {} } = parseHandlers;
//   return {
//     pdfObject: onParseName(name) || name,
//     remainder: trimmed.substring(fullMatch.length).trim()
//   }
// }

const parseName = (input, startIdx, parseHandlers={}) => {
  const sv = (new StringView(input)).subview(startIdx);
  const nameRegex = /^(?:[\ |\n]*)\/([^\ \]\n]+)(?=\ |\]|\n)/;
  const result = sv.match(nameRegex);
  if (!result) return null;

  const [fullMatch, name] = result;
  const { onParseName=() => {} } = parseHandlers;
  // return {
  //   pdfObject: onParseName(name) || name,
  //   remainder: trimmed.substring(fullMatch.length).trim()
  // }
  return [onParseName(name) || name, startIdx + fullMatch.length];
}

export default parseName;
