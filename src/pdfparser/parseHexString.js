const parseHexString = (input, parseHandlers={}) => {
  const trimmed = input.trim();
  const hexStringRegex = /^<([\dABCDEFabcdef]+)>/;
  const result = trimmed.match(hexStringRegex);
  if (!result) return null;

  const [fullMatch, hexString] = result;
  const { onParseHexString=() => {} } = parseHandlers;
  return {
    pdfObject: onParseHexString(hexString) || hexString,
    remainder: trimmed.substring(fullMatch.length).trim()
  }
}

export default parseHexString;
