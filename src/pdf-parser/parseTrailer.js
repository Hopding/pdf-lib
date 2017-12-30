import { arrayToString, trimArray, arrayIndexOf } from '../utils';
import parseDict from './parseDict';
import parseNumber from './parseNumber';

const parseTrailer = (input, parseHandlers = {}) => {
  const trimmed = trimArray(input);
  const trailerRegex = /^trailer[\n|\r|\ ]*([^]+)startxref[\n|\r|\ ]+?(\d+)[\n|\r|\ ]+?%%EOF/;
  const eofIdx = arrayIndexOf(trimmed, '%%EOF');
  const result = arrayToString(trimmed, 0, eofIdx + 5).match(trailerRegex);
  if (!result) return null;

  const [fullMatch, dictStr, lastXRefOffsetStr] = result;
  const { onParseTrailer = () => {} } = parseHandlers;
  const parsedOffset = parseNumber(
    trimmed.subarray(fullMatch - lastXRefOffsetStr.length),
    parseHandlers,
  );
  const dictBytes = new Uint8Array(dictStr.split('').map(c => c.charCodeAt(0)));
  const obj = {
    dict: parseDict(dictBytes, parseHandlers)[0],
    lastXRefOffset: parsedOffset ? parsedOffset[0] : Number(lastXRefOffsetStr),
  };

  return [onParseTrailer(obj) || obj, trimmed.subarray(fullMatch.length)];
};

const parseTrailerWithoutDict = (input, parseHandlers = {}) => {
  const trimmed = trimArray(input);
  const trailerRegex = /^startxref[\n|\r|\ ]+?(\d+)[\n|\r|\ ]+?%%EOF/;
  const eofIdx = arrayIndexOf(trimmed, '%%EOF');
  const result = arrayToString(trimmed, 0, eofIdx + 5).match(trailerRegex);
  if (!result) return null;

  const [fullMatch, lastXRefOffsetStr] = result;
  const { onParseTrailer = () => {} } = parseHandlers;
  const parsedOffset = parseNumber(
    trimmed.subarray(fullMatch - lastXRefOffsetStr.length),
    parseHandlers,
  );
  const obj = {
    lastXRefOffset: parsedOffset ? parsedOffset[0] : Number(lastXRefOffsetStr),
  };

  return [onParseTrailer(obj) || obj, trimmed.subarray(fullMatch.length)];
};

export { parseTrailer, parseTrailerWithoutDict };
