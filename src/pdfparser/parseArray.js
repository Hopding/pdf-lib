import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseDict from './parseDict';

const parseArray = (input, array=[]) => {
  const trimmed = input.trim();
  if (trimmed.charAt(0) !== '[') return null;

  let remainder = trimmed.substring(1).trim(); // Remove starting '[' bracket
  while (remainder.charAt(0) !== ']' && remainder.length > 0) {
    const { pdfObject, remainder: r } =
      parseNull(remainder)        ||
      parseIndirectRef(remainder) ||
      parseString(remainder)      ||
      parseHexString(remainder)   ||
      parseName(remainder)        ||
      parseBool(remainder)        ||
      parseNumber(remainder)      ||
      parseArray(remainder)       ||
      parseDict(remainder);

    array.push(pdfObject);
    remainder = r;
  }

  if (remainder.charAt(0) !== ']') throw new Error('Mismatched brackets!');
  remainder = remainder.substring(1).trim(); // Remove ending ']' bracket

  return { pdfObject: array, remainder };
}

export default parseArray;
