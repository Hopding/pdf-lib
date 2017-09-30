const parseIndirectRef = (input, parseHandlers={}) => {
  const trimmed = input.trim();
  const indirectRefRegex = /^(\d+)\ (\d+)\ R/;
  const result = trimmed.match(indirectRefRegex);
  if (!result) return null;

  const [fullMatch, objNum, genNum] = result;
  const { onParseIndirectRef=() => {} } = parseHandlers;
  const obj = { objNum, genNum };
  return {
    pdfObject: onParseIndirectRef(obj) || obj,
    remainder: trimmed.substring(fullMatch.length).trim()
  }
}

export default parseIndirectRef;
