const parseName = (input, parseHandlers={}) => {
  const trimmed = input.trim();
  const nameRegex = /^\/([^\ \]\n]+)(?=\ |\]|\n)/;
  const result = trimmed.match(nameRegex);
  if (!result) return null;

  const [fullMatch, name] = result;
  const { onParseName=() => {} } = parseHandlers;
  return {
    pdfObject: onParseName(name) || name,
    remainder: trimmed.substring(fullMatch.length).trim()
  }
}

export default parseName;
