import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseArray from './parseArray';

const parseDict = (input, obj={}) => {
  const trimmed = input.trim();
  if (trimmed.substring(0, 2) !== '<<') return null;

  let remainder = trimmed.substring(2).trim(); // Remove starting '<<'
  while (remainder.substring(0, 2) !== '>>' && remainder.length > 0) {
    // Parse the key for this entry
    const { pdfObject: key, remainder: r1 } = parseName(remainder);
    remainder = r1;

    // Parse the value for this entry
    const { pdfObject, remainder: r2 } =
      parseNull(remainder)        ||
      parseIndirectRef(remainder) ||
      parseString(remainder)      ||
      parseHexString(remainder)   ||
      parseName(remainder)        ||
      parseBool(remainder)        ||
      parseNumber(remainder)      ||
      parseArray(remainder)       ||
      parseDict(remainder);

    obj[key] = pdfObject;
    remainder = r2;
  }
  if (remainder.substring(0, 2) !== '>>') throw new Error('Mismatched brackets!');
  remainder = remainder.substring(2).trim(); // Remove ending '>>' pair

  return { pdfObject: obj, remainder };
}

export default parseDict;
