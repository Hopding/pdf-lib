const parseBool = (input, parseHandlers={}) => {
  const trimmed = input.trim();
  const boolRegex = /^(true|false)(?=\ |\]|\n)/;
  const result = trimmed.match(boolRegex);
  if (!result) return null;

  const [fullMatch, bool] = result;
  const { onParseBool=() => {} } = parseHandlers;
  return {
    pdfObject: onParseBool(bool) || bool === 'true' ? true : false,
    remainder: trimmed.substring(fullMatch.length).trim()
  }
}

export default parseBool;
