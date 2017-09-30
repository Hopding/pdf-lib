import parseDict from './parseDict';

const parseStream = (input, parseHandlers={}) => {
  const trimmed = input.trim();

  const parsedDict = parseDict(trimmed, parseHandlers);
  if (!parsedDict) return null;
  const { pdfObject: dict, remainder } = parsedDict;

  const streamRegex = /^stream([^]+)endstream/;
  const result = remainder.match(streamRegex);
  if (!result) return null;

  const [fullMatch, content] = result;
  const { onParseStream=() => {} } = parseHandlers;
  const obj = { dict, content };
  return {
    pdfObject: onParseStream(obj) || obj,
    remainder: remainder.substring(fullMatch.length).trim()
  }
}

export default parseStream;
