import { arrayToString, trimArray, arrayCharAt, arrayIndexOf } from '../utils';

const parseHeader = (input, parseHandlers={}) => {
  const trimmed = trimArray(input);
  const fileHeaderRegex = /^%PDF-(\d+)\.(\d+)/;
  let idx = 0;
  while (String.fromCharCode(trimmed[idx]).match(/^[%PDF-\d\.]/)) idx++;
  const result = arrayToString(trimmed, 0, idx).match(fileHeaderRegex);
  if (!result) return null;

  const [fullMatch, major, minor] = result;
  const { onParseHeader=() => {} } = parseHandlers;

  const withoutVersion = trimArray(trimmed.subarray(fullMatch.length));
  let returnArray = withoutVersion;

  // Check for a comment with binary characters
  if (arrayCharAt(withoutVersion, 0) === '%') {
    const nextNewline = arrayIndexOf(withoutVersion, '\n');
    returnArray = withoutVersion.subarray(nextNewline);
  }

  return [
    onParseHeader({ major, minor }) || { major, minor },
    returnArray,
  ];
}

export default parseHeader;
