/* @flow */
import {
  PDFDictionary,
  PDFObjectStream,
  PDFIndirectObject,
  PDFNumber,
} from '../pdf-objects';
import { error, arrayToString, arrayFindIndexOf } from '../utils';

import parseNull from './parseNull';
import parseIndirectRef from './parseIndirectRef';
import parseString from './parseString';
import parseHexString from './parseHexString';
import parseName from './parseName';
import parseBool from './parseBool';
import parseNumber from './parseNumber';
import parseDict from './parseDict';
import parseArray from './parseArray';

import type { ParseHandlers } from '.';

/**
Accepts a PDFDictionary and an array of bytes as input. The PDFDictionary should
be a PDF Object Stream dictionary, and the array of bytes should be its content.

Attempts to parse the pairs of integers at the start of the input bytes. Each
pair describes one object within the Object Stream - its object number and byte
offset within the stream, respectively.

Returns an array of objects representing the parsed integer pairs.
*/
const parseObjData = (
  dict: PDFDictionary,
  input: Uint8Array,
): { objNum: number, byteOffset: number }[] => {
  // Extract the value of the "N" entry from the dict
  const N: PDFNumber =
    dict.get('N') || error('Object stream dict must have "N" entry');
  const numObjects = N.number;

  // Regex representing a pair of integers
  const objDatumRegex = /^ *(\d+) *(\d+) */;

  // Find the first non-numeric character (not including EOLs and spaces) in the
  // input bytes
  const firstNonNumIdx = arrayFindIndexOf(input, charByte =>
    String.fromCharCode(charByte).match(/[^\d\n\r ]/),
  );

  // Convert the input bytes to a string, up to the first non-numeric character
  const objDatumsStr = arrayToString(input, 0, firstNonNumIdx);

  // Repeatedly apply the integer pair regex to the input string to build up an
  // array of the parsed integer pairs
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

/**
Accepts an a PDFDictionary and an array of bytes as input. The PDFDictionary
should be a PDF Object Stream dictionary, and the array of bytes should be its
content. *The array of bytes is expected to have been decoded (based on the
"Filter"s in the dictionary) prior to being passed to this function.*

After parsing the integer pairs from the start of the input bytes, the objects
themselves will be parsed from the remaining input bytes.

An PDFObjectStream will be returned, representing the objects parsed
from the Object Stream. The "onParseObjectStream" parse handler will also be
called with the PDFObjectStream.
*/
const parseObjectStream = (
  dict: PDFDictionary,
  input: Uint8Array,
  parseHandlers: ParseHandlers = {},
): PDFObjectStream => {
  // Parse the pairs of integers from start of input bytes
  const objData = parseObjData(dict, input);

  // Extract the value of the "First" entry in the dict
  const First =
    dict.get('First') || error('Object stream dict must have "First" entry');
  const firstObjOffset = First.number;

  // Map each pair of integers to a PDFIndirectObject
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
      parseDict(subarray, parseHandlers) ||
      error('Failed to parse object in Object Stream');

    return PDFIndirectObject.of(pdfObject).setReferenceNumbers(objNum, 0);
  });

  const objectStream = PDFObjectStream.from(dict, indirectObjects);

  // Call the parse handler
  if (parseHandlers.onParseObjectStream) {
    parseHandlers.onParseObjectStream(objectStream);
  }

  return objectStream;
};

export default parseObjectStream;
