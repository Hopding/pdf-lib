import StringView from '../StringView';

// const parseIndirectRef = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//   const indirectRefRegex = /^(\d+)\ (\d+)\ R/;
//   const result = trimmed.match(indirectRefRegex);
//   if (!result) return null;
//
//   const [fullMatch, objNum, genNum] = result;
//   const { onParseIndirectRef=() => {} } = parseHandlers;
//   const obj = { objNum, genNum };
//   return {
//     pdfObject: onParseIndirectRef(obj) || obj,
//     remainder: trimmed.substring(fullMatch.length).trim()
//   }
// }

const parseIndirectRef = (input, startIdx, parseHandlers={}) => {
  const sv = (new StringView(input)).subview(startIdx);
  const indirectRefRegex = /^[\n\ ]*(\d+)\ (\d+)\ R/;
  const result = sv.match(indirectRefRegex);
  if (!result) return null;

  const [fullMatch, objNum, genNum] = result;
  const { onParseIndirectRef=() => {} } = parseHandlers;
  const obj = { objNum, genNum };
  // return {
  //   pdfObject: onParseIndirectRef(obj) || obj,
  //   remainder: trimmed.substring(fullMatch.length).trim()
  // }
  return [onParseIndirectRef(obj) || obj, startIdx + fullMatch.length];
}

export default parseIndirectRef;
