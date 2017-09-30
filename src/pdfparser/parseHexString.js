const parseHexString = (input) => {
  const trimmed = input.trim();
  const hexStringRegex = /^<([\dABCDEFabcdef]+)>/;
  const result = trimmed.match(hexStringRegex);
  if (!result) return null;

  const [fullMatch, hexString] = result;
  return {
    pdfObject: hexString,
    remainder: trimmed.substring(fullMatch.length).trim()
  }
}

export default parseHexString;
