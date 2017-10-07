import { arrayToString, trimArray } from '../utils';

const parseNull = (input, parseHandlers={}) => {
  const trimmed = trimArray(input);
  if (arrayToString(trimmed, 0, 4) !== 'null') return null;

  const { onParseNull=() => {} } = parseHandlers;
  return [onParseNull(null) || null, trimmed.subarray(4)];
}

export default parseNull;
