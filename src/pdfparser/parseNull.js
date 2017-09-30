const parseNull = (input, parseHandlers={}) => {
  const trimmed = input.trim();
  const result = trimmed.match(`^null`);
  if (!result) return null;

  const { onParseNull=() => {} } = parseHandlers;
  return {
    pdfObject: onParseNull(null) || null,
    remainder: trimmed.substring(4),
  };
}

export default parseNull;
