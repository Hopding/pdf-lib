const parseHeader = (input) => {
  const trimmed = input.trim();
  const fileHeaderRegex = /^%PDF-(\d+)\.(\d+)/;
  const result = trimmed.match(fileHeaderRegex);
  if (!result) return null;

  const [fullMatch, major, minor] = result;
  return {
    pdfObject: {major, minor},
    remainder: trimmed.substring(fullMatch.length).trim()
  };
}

export default parseHeader;
