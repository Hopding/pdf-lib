import parseDict from './parseDict';
const parseTrailer = (input) => {
  const trimmed = input.trim();
  const trailerRegex = /^trailer[\n|\ ]*([^]+)startxref[\n|\ ]+?(\d+)[\n|\ ]+?%%EOF/;
  const result = trimmed.match(trailerRegex);
  if (!result) return null;

  const [fullMatch, dictStr, lastXRefOffset] = result;
  return {
    pdfObject: {
      dict: parseDict(dictStr).pdfObject,
      lastXRefOffset,
    },
    remainder: trimmed.substring(fullMatch.length).trim(),
  }
}

export default parseTrailer;
