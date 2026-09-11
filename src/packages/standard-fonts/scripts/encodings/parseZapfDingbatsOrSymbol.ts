export const parseZapfDingbatsOrSymbol = (data: string) => {
  return data
    .split('\n')
    .filter((line) => line[0] !== '#')
    .filter(Boolean)
    .map((line) => line.split('\t'))
    .map(([unicodeCode, postscriptCode, unicodeName, postscriptName]) => [
      Number(`0x${unicodeCode}`), // Convert hex string to number
      Number(`0x${postscriptCode}`), // Convert hex string to Number
      unicodeName.substring(2), // Remove '# ' prefix
      postscriptName
        .substring(2) // Remove '# ' prefix
        .replace(' (CUS)', ''), // Remove the ' (CUS)' parentheticals
    ])
    .reduce((acc, [unicodeCode, postscriptCode, , postscriptName]) => {
      acc[unicodeCode] = [postscriptCode, postscriptName];
      return acc;
    }, {});
};
