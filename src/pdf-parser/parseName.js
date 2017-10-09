import { arrayToString, trimArray } from '../utils';

const parseName = (input, parseHandlers = {}) => {
  const trimmed = trimArray(input);
  const nameRegex = /^\/([^\ \n\r\]]+)/;
  let idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[^\ \n\r\]]/)) idx++;
  const result = arrayToString(trimmed, 0, idx).match(nameRegex);
  if (!result) return null;

  const [fullMatch, name] = result;
  const { onParseName = () => {} } = parseHandlers;
  return [onParseName(name) || name, trimmed.subarray(fullMatch.length)];
};

export default parseName;
