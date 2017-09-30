import parseDict from './parseDict';

const parseStream = (input) => {
  const trimmed = input.trim();

  const parsedDict = parseDict(trimmed);
  if (!parsedDict) return null;
  const { pdfObject: dict, remainder } = parseDict(trimmed);

  const streamRegex = /^stream([^]+)endstream/;
  const result = remainder.match(streamRegex);
  if (!result) return null;

  const [fullMatch, content] = result;
  return {
    pdfObject: { dict, content },
    remainder: remainder.substring(fullMatch.length).trim()
  }
}

export default parseStream;
