const parseXRefTable = (input) => {
  const trimmed = input.trim();
  const xRefTableRegex = /^xref[\n|\ ]*(\d+)\ (\d+)\n([\d|\ |\n|f|n]+)/;
  const result = trimmed.match(xRefTableRegex);
  if (!result) return null;

  const [fullMatch, firstObjNum, objCount, contents] = result;
  return {
    pdfObject: {
      firstObjNum,
      objCount,
      contents,
    },
    remainder: trimmed.substring(fullMatch.length).trim(),
  };
}

export default parseXRefTable;
