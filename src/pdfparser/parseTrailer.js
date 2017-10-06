import StringView from '../StringView';
import parseDict from './parseDict';
import parseNumber from './parseNumber';

// const parseTrailer = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//   const trailerRegex = /^trailer[\n|\ ]*([^]+)startxref[\n|\ ]+?(\d+)[\n|\ ]+?%%EOF/;
//   const result = trimmed.match(trailerRegex);
//   if (!result) return null;
//
//   const [fullMatch, dictStr, lastXRefOffsetStr] = result;
//   const { onParseTrailer=() => {} } = parseHandlers;
//   const parsedOffset = parseNumber(lastXRefOffsetStr, parseHandlers);
//   const obj = {
//     dict: parseDict(dictStr, parseHandlers).pdfObject,
//     lastXRefOffset: parsedOffset ? parsedOffset.pdfObject : Number(lastXRefOffsetStr),
//   };
//   return {
//     pdfObject: onParseTrailer(obj) || obj,
//     remainder: trimmed.substring(fullMatch.length).trim(),
//   }
// }

const parseTrailer = (input, startIdx, parseHandlers={}) => {
  // const trimmed = input.trim();
  const sv = (new StringView(input)).subview(startIdx);
  const trailerRegex = /^[\n|\ ]*trailer[\n|\ ]*([^]+)startxref[\n|\ ]+?(\d+)[\n|\ ]+?%%EOF/;
  const result = sv.match(trailerRegex);
  console.log('result:', result)
  if (!result) return null;

  const [fullMatch, dictStr, lastXRefOffsetStr] = result;
  const { onParseTrailer=() => {} } = parseHandlers;
  const parsedOffset = parseNumber(
    input,
    startIdx + (fullMatch - lastXRefOffsetStr.length),
    parseHandlers,
  );
  const dictBytes = new Uint8Array(dictStr.split('').map(c => c.charCodeAt(0)));
  const obj = {
    dict: parseDict(dictBytes, 0, parseHandlers)[0],
    lastXRefOffset: parsedOffset ? parsedOffset[0] : Number(lastXRefOffsetStr),
  };

  // return {
  //   pdfObject: onParseTrailer(obj) || obj,
  //   remainder: trimmed.substring(fullMatch.length).trim(),
  // }
  console.log('parseTrailer_retVal:', [onParseTrailer(obj) || obj, startIdx + fullMatch.length])
  return [onParseTrailer(obj) || obj, startIdx + fullMatch.length];
}

export default parseTrailer;
