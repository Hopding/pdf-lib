import parseDict from './parseDict';
import decodeStream from './encoding/decodeStream';
import parseObjectStream from './parseObjectStream';
import {
  arrayIndexOf,
  arrayToString,
  trimArray,
  writeToDebugFile,
} from '../utils';

const parseStream = (input, parseHandlers = {}) => {
  const parsedDict = parseDict(input, parseHandlers);
  if (!parsedDict) return null;
  const [dict, r] = parsedDict;

  const trimmed = trimArray(r);
  let startstreamIdx;
  if (arrayToString(trimmed, 0, 7) === 'stream\n') startstreamIdx = 7;
  else if (arrayToString(trimmed, 0, 8) === 'stream\r\n') startstreamIdx = 8;

  if (!startstreamIdx) return null;

  const endstreamIdx =
    arrayIndexOf(trimmed, '\nendstream') ||
    arrayIndexOf(trimmed, '\rendstream');
  if (!endstreamIdx && endstreamIdx !== 0) throw new Error('Invalid Stream!');

  const contents = trimmed.slice(startstreamIdx, endstreamIdx);
  const endobjIdx = arrayIndexOf(trimmed, 'endobj', endstreamIdx);
  if (arrayToString(trimmed, endstreamIdx, endobjIdx).trim() !== 'endstream') {
    throw new Error('Invalid Stream!');
  }

  const { onParseStream = () => {} } = parseHandlers;

  // For now, only decode object streams - until support for parsing the contents
  // of page content streams is also added
  const type = dict.get('Type');
  if (type && type.key === 'ObjStm') {
    const decoded = decodeStream(dict, contents);
    parseObjectStream(dict, decoded, parseHandlers);
  }

  const obj = { dict, contents };
  return [onParseStream(obj) || obj, trimmed.subarray(endstreamIdx + 10)];
};

export default parseStream;
