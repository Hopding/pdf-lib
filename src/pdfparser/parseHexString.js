import StringView from '../StringView';

// const parseHexString = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//   const hexStringRegex = /^<([\dABCDEFabcdef]+)>/;
//   const result = trimmed.match(hexStringRegex);
//   if (!result) return null;
//
//   const [fullMatch, hexString] = result;
//   const { onParseHexString=() => {} } = parseHandlers;
//   return {
//     pdfObject: onParseHexString(hexString) || hexString,
//     remainder: trimmed.substring(fullMatch.length).trim()
//   }
// }

const parseHexString = (input, startIdx, parseHandlers={}) => {
  const sv = (new StringView(input)).subview(startIdx);
  // const trimmed = inputStr.trim();
  const hexStringRegex = /^[\n|\ ]*<([\dABCDEFabcdef]+)>/;
  const result = sv.match(hexStringRegex);
  if (!result) return null;

  const [fullMatch, hexString] = result;
  const { onParseHexString=() => {} } = parseHandlers;
  // return {
  //   pdfObject: onParseHexString(hexString) || hexString,
  //   remainder: trimmed.substring(fullMatch.length).trim()
  // }
  return [onParseHexString(hexString) || hexString, startIdx + fullMatch.length];
}

export default parseHexString;
