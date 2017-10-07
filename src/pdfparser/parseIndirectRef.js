import { arrayToString, arrayIndexOf, trimArray, arrayCharAt } from '../utils';

const parseIndirectRef = (input, parseHandlers={}) => {
  const trimmed = trimArray(input);
  const indirectRefRegex = /^(\d+)\ (\d+)\ R/;
  const rIdx = arrayIndexOf(trimmed, 'R');
  const result = arrayToString(trimmed, 0, rIdx + 1).match(indirectRefRegex);
  if (!result) return null;

  const [fullMatch, objNum, genNum] = result;
  const { onParseIndirectRef=() => {} } = parseHandlers;
  const obj = { objNum, genNum };
  return [onParseIndirectRef(obj) || obj, trimmed.subarray(fullMatch.length)];
}

export default parseIndirectRef;
