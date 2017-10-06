import StringView from '../StringView';
import parseDict from './parseDict';
import { arrayIndexOf } from '../utils';

// const parseStream = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//
//   const parsedDict = parseDict(trimmed, parseHandlers);
//   if (!parsedDict) return null;
//   const { pdfObject: dict, remainder } = parsedDict;
//
//   const streamRegex = /^stream([^]+)endstream/;
//   const result = remainder.match(streamRegex);
//   if (!result) return null;
//
//   const [fullMatch, content] = result;
//   const { onParseStream=() => {} } = parseHandlers;
//   const obj = { dict, content };
//   return {
//     pdfObject: onParseStream(obj) || obj,
//     remainder: remainder.substring(fullMatch.length).trim()
//   }
// }

const parseStream = (input, startIdx, parseHandlers={}) => {
  const parsedDict = parseDict(input, startIdx, parseHandlers);
  if (!parsedDict) return null;
  const [dict, dictStopIdx] = parsedDict;

  // const streamRegex = /^stream([^]+)endstream/;
  const sv = (new StringView(input)).subview(dictStopIdx);
  const result = sv.match(/^[\n\ ]*stream/);
  if (!result) return null;

  const [fullMatch] = result;

  const endStreamIdx = arrayIndexOf(input, 'endstream', dictStopIdx + fullMatch.length);
  const content = input.slice(dictStopIdx + fullMatch.length, endStreamIdx);

  const endobjIdx = arrayIndexOf(input, 'endobj', endStreamIdx);

  const { onParseStream=() => {} } = parseHandlers;
  const obj = { dict, content };
  // return {
  //   pdfObject: onParseStream(obj) || obj,
  //   remainder: remainder.substring(fullMatch.length).trim()
  // }
  console.log('parseStream_return:',
    Array.from(
      input.slice(endobjIdx, endobjIdx + 10
    )).map(n => String.fromCharCode(n)).join('')
  )
  return [onParseStream(obj) || obj, endobjIdx + 6];
}

export default parseStream;
