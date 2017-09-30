const parseXRefTable = (input, parseHandlers={}) => {
  const trimmed = input.trim();
  const xRefTableRegex = /^xref[\n|\ ]*(\d+)\ (\d+)\n([\d|\ |\n|f|n]+)/;
  const result = trimmed.match(xRefTableRegex);
  if (!result) return null;

  const [fullMatch, firstObjNum, objCount, contents] = result;
  const { onParseXRefTable=() => {} } = parseHandlers;
  const obj = { firstObjNum, objCount, contents };
  return {
    pdfObject: onParseXRefTable(obj) || obj,
    remainder: trimmed.substring(fullMatch.length).trim(),
  };
}

export default parseXRefTable;
