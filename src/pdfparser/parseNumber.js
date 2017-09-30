const parseNumber = (input) => {
  const trimmed = input.trim();
  const numRegex  = /^(((\+{1}|\-{1})?\d+(\.\d+)?)|((\+{1}|\-{1})?\.\d+))((?=\ |\]|\n))?/;
  const result = trimmed.match(numRegex);
  if (!result) return null;

  const [fullMatch, num] = result;
  return {
    pdfObject: Number(num),
    remainder: trimmed.substring(fullMatch.length).trim()
  }
}

export default parseNumber;
