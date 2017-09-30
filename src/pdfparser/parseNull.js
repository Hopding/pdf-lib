const parseNull = (input) => {
  const trimmed = input.trim();
  const result = trimmed.match(`^null`);
  if (!result) return null;

  return { pdfObject: null, remainder: trimmed.substring(4) };
}

export default parseNull;
