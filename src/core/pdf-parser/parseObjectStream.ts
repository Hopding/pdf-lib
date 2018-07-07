import { PDFDictionary, PDFIndirectObject, PDFNumber } from 'core/pdf-objects';
import { PDFObjectStream } from 'core/pdf-structures';
import { arrayFindIndexOf, arrayToString, error } from 'utils';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

import parseArray from './parseArray';
import parseBool from './parseBool';
import parseDict from './parseDict';
import parseHexString from './parseHexString';
import parseIndirectRef from './parseIndirectRef';
import parseName from './parseName';
import parseNull from './parseNull';
import parseNumber from './parseNumber';
import parseString from './parseString';

import { IParseHandlers } from './PDFParser';

/**
 * Accepts a PDFDictionary and an array of bytes as input. The PDFDictionary should
 * be a PDF Object Stream dictionary, and the array of bytes should be the Object Stream's content.
 *
 * Attempts to parse the pairs of integers at the start of the input bytes. Each
 * pair describes one object within the Object Stream - its object number and byte
 * offset within the stream, respectively.
 *
 * Returns an array of objects representing the parsed integer pairs.
 */
const parseObjData = (
  dict: PDFDictionary,
  input: Uint8Array,
): Array<{ objNum: number; byteOffset: number }> => {
  // Extract the value of the "N" entry from the dict
  const numObjects = (dict.get('N') as PDFNumber).number;

  // Regex representing a pair of integers
  const objDatumRegex = /^ *(\d+) *(\d+) */;

  // Find the first non-numeric character (not including EOLs and spaces) in the
  // input bytes
  const firstNonNumIdx = arrayFindIndexOf(
    input,
    (charByte) => !!String.fromCharCode(charByte).match(/[^\d\n\r ]/),
  );

  // Convert the input bytes to a string, up to the first non-numeric character
  const objDatumsStr = arrayToString(input, 0, firstNonNumIdx);

  // Repeatedly apply the integer pair regex to the input string to build up an
  // array of the parsed integer pairs
  const objData: Array<{ objNum: number; byteOffset: number }> = [];
  let i = 0;
  let remaining = objDatumsStr;
  while (i < numObjects) {
    const [fullmatch, objNum, byteOffset] = remaining.match(objDatumRegex)!;
    objData.push({ objNum: Number(objNum), byteOffset: Number(byteOffset) });

    remaining = remaining.substring(fullmatch.length);
    i += 1;
  }

  return objData;
};

/**
 * Accepts an a PDFDictionary and an array of bytes as input. The PDFDictionary
 * should be a PDF Object Stream dictionary, and the array of bytes should be the Object Stream's
 * content. *The array of bytes is expected to have been decoded (based on the
 * "Filter"s in the dictionary) prior to being passed to this function.*
 *
 * After parsing the integer pairs from the start of the input bytes, the objects
 * themselves will be parsed from the remaining input bytes.
 *
 * A PDFObjectStream will be returned, representing the objects parsed
 * from the Object Stream. The "onParseObjectStream" parse handler will also be
 * called with the parsed PDFObjectStream object.
 */
const parseObjectStream = (
  dict: PDFDictionary,
  input: Uint8Array,
  index: PDFObjectIndex,
  parseHandlers: IParseHandlers = {},
): PDFObjectStream => {
  // Parse the pairs of integers from start of input bytes
  const objData = parseObjData(dict, input);

  // Extract the value of the "First" entry in the dict
  const First: PDFNumber = dict.get('First');
  const firstObjOffset = First.number;

  // Map each pair of integers to a PDFIndirectObject
  const indirectObjects = objData.map(({ objNum, byteOffset }) => {
    const subarray = input.subarray(firstObjOffset + byteOffset);

    const [pdfObject] =
      parseDict(subarray, index, parseHandlers) ||
      parseArray(subarray, index, parseHandlers) ||
      parseName(subarray, parseHandlers) ||
      parseString(subarray, parseHandlers) ||
      parseIndirectRef(subarray, parseHandlers) ||
      parseNumber(subarray, parseHandlers) ||
      parseHexString(subarray, parseHandlers) ||
      parseBool(subarray, parseHandlers) ||
      parseNull(subarray, parseHandlers) ||
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
