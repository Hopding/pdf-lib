import { arrayToString, trimArray } from '../utils';

const parseNumber = (input, parseHandlers = {}) => {
  const trimmed = trimArray(input);
  const numRegex = /^(((\+{1}|\-{1})?\d+(\.\d+)?)|((\+{1}|\-{1})?\.\d+))/;
  let idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[+-\.\d]/)) idx++;
  const result = arrayToString(trimmed, 0, idx).match(numRegex);
  if (!result) return null;

  const [fullMatch, num] = result;
  const { onParseNumber = () => {} } = parseHandlers;
  return [
    onParseNumber(num) || Number(num),
    trimmed.subarray(fullMatch.length),
  ];
};

export default parseNumber;
