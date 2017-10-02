import parseDict from './parseDict';
import parseNumber from './parseNumber';

const parseTrailer = (input, parseHandlers={}) => {
  const trimmed = input.trim();
  const trailerRegex = /^trailer[\n|\ ]*([^]+)startxref[\n|\ ]+?(\d+)[\n|\ ]+?%%EOF/;
  const result = trimmed.match(trailerRegex);
  if (!result) return null;

  const [fullMatch, dictStr, lastXRefOffsetStr] = result;
  const { onParseTrailer=() => {} } = parseHandlers;
  const parsedOffset = parseNumber(lastXRefOffsetStr, parseHandlers);
  const obj = {
    dict: parseDict(dictStr, parseHandlers).pdfObject,
    lastXRefOffset: parsedOffset ? parsedOffset.pdfObject : Number(lastXRefOffsetStr),
  };
  return {
    pdfObject: onParseTrailer(obj) || obj,
    remainder: trimmed.substring(fullMatch.length).trim(),
  }
}

export default parseTrailer;
