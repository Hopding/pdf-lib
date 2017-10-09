import { arrayToString } from '../utils';

const parseBool = (input, parseHandlers = {}) => {
  const boolRegex = /^(?:[\ |\n|\r]*)(true|false)(?=\ |\]|\n|\r)/;
  let idx = 0;
  while (String.fromCharCode(input[idx]).match(/^[\ \n\rtruefalse]/)) idx++;
  const result = arrayToString(input, 0, idx).match(boolRegex);
  if (!result) return null;

  const [fullMatch, bool] = result;
  const { onParseBool = () => {} } = parseHandlers;
  return [onParseBool(bool) || bool, input.subarray(fullMatch.length)];
};

export default parseBool;
