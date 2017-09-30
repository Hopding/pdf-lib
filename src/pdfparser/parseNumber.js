const parseNumber = (input, parseHandlers={}) => {
  const trimmed = input.trim();
  const numRegex  = /^(((\+{1}|\-{1})?\d+(\.\d+)?)|((\+{1}|\-{1})?\.\d+))((?=\ |\]|\n))?/;
  const result = trimmed.match(numRegex);
  if (!result) return null;

  const [fullMatch, num] = result;
  const { onParseNumber=() => {} } = parseHandlers;
  return {
    pdfObject: onParseNumber(num) || Number(num),
    remainder: trimmed.substring(fullMatch.length).trim()
  }
}

export default parseNumber;
