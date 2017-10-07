import parseDict from './parseDict';
import { arrayIndexOf, arrayToString, trimArray } from '../utils';

const parseStream = (input, parseHandlers={}) => {
  const parsedDict = parseDict(input, parseHandlers);
  if (!parsedDict) return null;
  const [dict, r] = parsedDict;

  const trimmed = trimArray(r);
  if (arrayToString(trimmed, 0, 6) !== 'stream') return null;
  const endstreamIdx = arrayIndexOf(trimmed, 'endstream');
  if (endstreamIdx === undefined) throw new Error('Invalid Stream!');

  const contents = trimmed.slice(6, endstreamIdx);
  const endobjIdx = arrayIndexOf(trimmed, 'endobj', endstreamIdx);
  if (arrayToString(trimmed, endstreamIdx, endobjIdx).trim() !== 'endstream')
    throw new Error('Invalid Stream!')

  const { onParseStream=() => {} } = parseHandlers;
  const obj = { dict, contents };
  return [onParseStream(obj) || obj, trimmed.subarray(endstreamIdx + 9)];
}

export default parseStream;
