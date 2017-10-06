import StringView from '../StringView';
// const parseHeader = (input, parseHandlers={}) => {
//   const trimmed = input.trim();
//   const fileHeaderRegex = /^%PDF-(\d+)\.(\d+)/;
//   const result = trimmed.match(fileHeaderRegex);
//   if (!result) return null;
//
//   const [fullMatch, major, minor] = result;
//   const { onParseHeader=() => {} } = parseHandlers;
//   return {
//     pdfObject: onParseHeader({ major, minor }) || { major, minor },
//     remainder: trimmed.substring(fullMatch.length).trim()
//   };
// }

const parseHeader = (input, startIdx, parseHandlers={}) => {
  const sv = (new StringView(input)).subview(startIdx);
  const fileHeaderRegex = /^(?:(\ |\n)*)%PDF-(\d+)\.(\d+)/;
  const result = sv.match(fileHeaderRegex);
  if (!result) return null;

  const [fullMatch, major, minor] = result;
  const { onParseHeader=() => {} } = parseHandlers;
  // return {
  //   pdfObject: onParseHeader({ major, minor }) || { major, minor },
  //   stopIdx: startIdx + fullMatch.length,
  // };
  return [
    onParseHeader({ major, minor }) || { major, minor },
    startIdx + fullMatch.length,
  ];
}

export default parseHeader;
