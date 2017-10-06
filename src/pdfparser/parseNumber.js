import StringView from '../StringView';

// const parseNumber = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//   const numRegex  = /^(((\+{1}|\-{1})?\d+(\.\d+)?)|((\+{1}|\-{1})?\.\d+))((?=\ |\]|\n))?/;
//   const result = trimmed.match(numRegex);
//   if (!result) return null;
//
//   const [fullMatch, num] = result;
//   const { onParseNumber=() => {} } = parseHandlers;
//   return {
//     pdfObject: onParseNumber(num) || Number(num),
//     remainder: trimmed.substring(fullMatch.length).trim()
//   }
// }

const parseNumber = (input, startIdx, parseHandlers={}) => {
  const sv = (new StringView(input)).subview(startIdx);
  const numRegex  = /^(?:[\ |\n]*)(((\+{1}|\-{1})?\d+(\.\d+)?)|((\+{1}|\-{1})?\.\d+))((?=\ |\]|\n))?/;
  const result = sv.match(numRegex);
  if (!result) return null;

  const [fullMatch, num] = result;
  const { onParseNumber=() => {} } = parseHandlers;
  // return {
  //   pdfObject: onParseNumber(num) || Number(num),
  //   remainder: trimmed.substring(fullMatch.length).trim()
  // }
  return [onParseNumber(num) || Number(num), startIdx + fullMatch.length];
}

export default parseNumber;
