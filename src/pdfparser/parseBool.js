const parseBool = (input) => {
  const trimmed = input.trim();
  const boolRegex = /^(true|false)(?=\ |\]|\n)/;
  const result = trimmed.match(boolRegex);
  if (!result) return null;

  const [fullMatch, bool] = result;
  return {
    pdfObject: bool === 'true' ? true : false,
    remainder: trimmed.substring(fullMatch.length).trim()
  }
}

export default parseBool;
