const parseName = (input) => {
  const trimmed = input.trim();
  const nameRegex = /^\/([^\ \]\n]+)(?=\ |\]|\n)/;
  const result = trimmed.match(nameRegex);
  if (!result) return null;

  const [fullMatch, name] = result;
  return {
    pdfObject: name,
    remainder: trimmed.substring(fullMatch.length).trim()
  }
}

export default parseName;
