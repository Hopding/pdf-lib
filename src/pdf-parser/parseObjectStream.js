/* @flow */
import { PDFDictionary, PDFIndirectObject } from '../pdf-objects';
import { arrayToString, arrayFindIndexOfByChar } from '../utils';

import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseDict from './parseDict';
import parseArray from './parseArray';

const parseObjData = (dict: PDFDictionary, input: Uint8Array) => {
  const numObjects = dict.get('N').number;
  const objDatumRegex = /^ *(\d+) *(\d+) */;

  const firstNonNumIdx = arrayFindIndexOfByChar(input, c =>
    c.match(/[^\d\n\r ]/),
  );

  const objDatumsStr = arrayToString(input, 0, firstNonNumIdx);

  const objData: { objNum: number, byteOffset: number }[] = [];
  let i = 0;
  let remaining = objDatumsStr;
  while (i < numObjects) {
    const [fullmatch, objNum, byteOffset] = remaining.match(objDatumRegex);
    objData.push({ objNum: Number(objNum), byteOffset: Number(byteOffset) });
    remaining = remaining.substring(fullmatch.length);
    i += 1;
  }

  return objData;
};

const parseObjectStream = (
  dict: PDFDictionary,
  input: Uint8Array,
  parseHandlers: Object = {},
) => {
  const objData = parseObjData(dict, input);
  const firstObjOffset = dict.get('First').number;

  const indirectObjects = objData.map(({ objNum, byteOffset }) => {
    const subarray = input.subarray(firstObjOffset + byteOffset);

    const [pdfObject] =
      parseNull(subarray, parseHandlers) ||
      parseIndirectRef(subarray, parseHandlers) ||
      parseString(subarray, parseHandlers) ||
      parseHexString(subarray, parseHandlers) ||
      parseName(subarray, parseHandlers) ||
      parseBool(subarray, parseHandlers) ||
      parseNumber(subarray, parseHandlers) ||
      parseArray(subarray, parseHandlers) ||
      parseDict(subarray, parseHandlers);

    return PDFIndirectObject.from(pdfObject).setReferenceNumbers(objNum, 0);
  });

  const { onParseObjectStream = () => {} } = parseHandlers;
  return onParseObjectStream(indirectObjects) || indirectObjects;
};

export default parseObjectStream;
