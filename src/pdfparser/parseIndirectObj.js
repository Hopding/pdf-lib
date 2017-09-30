import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseDict from './parseDict';
import parseArray from './parseArray';
import parseStream from './parseStream';

const parseIndirectObj = (input) => {
  const trimmed = input.trim();
  const indirectObjRegex = /^(\d+)\ (\d+)\ obj/;
  const result = trimmed.match(indirectObjRegex);
  if (!result) return null;

  const [fullMatch, objNum, genNum] = result;
  const endobjIdx = trimmed.indexOf('endobj');
  const content = trimmed.substring(fullMatch.length, endobjIdx);

  const { pdfObject: contentObj, remainder: r } =
    parseNull(content)        ||
    parseStream(content)      ||
    parseIndirectRef(content) ||
    parseString(content)      ||
    parseHexString(content)   ||
    parseName(content)        ||
    parseBool(content)        ||
    parseNumber(content)      ||
    parseArray(content)       ||
    parseDict(content);
  if (r.trim().length > 0) throw new Error('Failed to parse object contents');

  return {
    pdfObject: { objNum, genNum, contentObj },
    remainder: trimmed.substring(endobjIdx + 6).trim()
  }
}

export default parseIndirectObj;
