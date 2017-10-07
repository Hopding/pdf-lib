import { arrayToString, trimArray } from '../utils';

const parseHeader = (input, parseHandlers={}) => {
  const trimmed = trimArray(input);
  const fileHeaderRegex = /^%PDF-(\d+)\.(\d+)/;
  let idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[%PDF-\d\.]/)) idx++;
  const result = arrayToString(trimmed, 0, idx).match(fileHeaderRegex);
  if (!result) return null;

  const [fullMatch, major, minor] = result;
  const { onParseHeader=() => {} } = parseHandlers;
  return [
    onParseHeader({ major, minor }) || { major, minor },
    trimmed.subarray(fullMatch.length),
  ];
}

export default parseHeader;
