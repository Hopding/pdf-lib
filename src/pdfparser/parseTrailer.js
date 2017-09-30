import parseDict from './parseDict';

const parseTrailer = (input, parseHandlers={}) => {
  const trimmed = input.trim();
  const trailerRegex = /^trailer[\n|\ ]*([^]+)startxref[\n|\ ]+?(\d+)[\n|\ ]+?%%EOF/;
  const result = trimmed.match(trailerRegex);
  if (!result) return null;

  const [fullMatch, dictStr, lastXRefOffset] = result;
  const { onParseTrailer=() => {} } = parseHandlers;
  const obj = {
    dict: parseDict(dictStr, parseHandlers).pdfObject,
    lastXRefOffset,
  };
  return {
    pdfObject: onParseTrailer(obj) || obj,
    remainder: trimmed.substring(fullMatch.length).trim(),
  }
}

export default parseTrailer;
