const parseIndirectRef = (input) => {
  const trimmed = input.trim();
  const indirectRefRegex = /^(\d+\ \d+\ R)/;
  const result = trimmed.match(indirectRefRegex);
  if (!result) return null;

  const [fullMatch, ref] = result;
  return {
    pdfObject: ref,
    remainder: trimmed.substring(fullMatch.length).trim()
  }
}

export default parseIndirectRef;
