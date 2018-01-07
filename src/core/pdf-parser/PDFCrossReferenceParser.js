/* @flow */
import { XRef, PDFTrailer } from '../pdf-structures';
import { parseTrailer, parseTrailerWithoutDict } from './parseTrailer';
import parseXRefTable from './parseXRefTable';
import { error, arrayIndexOfReverse } from '../../utils';

const parseXRefOffset = (input: Uint8Array) => {
  const startxrefOffset = arrayIndexOfReverse(
    input,
    'startxref',
    input.length - 9,
  );
  const [trailer] = parseTrailerWithoutDict(input.subarray(startxrefOffset));
  return trailer.offset;
};

const parseAllXRefTables = (input: Uint8Array, startingOffset: number) => {
  const parsedObjects: [XRef.Table, PDFTrailer][] = [];
  let [table, r1] = parseXRefTable(input.subarray(startingOffset));
  let [trailer, r2] = parseTrailer(r1);
  parsedObjects.push([table, trailer]);

  let remaining = r2;
  while (trailer.dictionary.get('Prev')) {
    const offset = trailer.dictionary.get('Prev').number;
    [table, remaining] = parseXRefTable(input.subarray(offset));
    [trailer, remaining] = parseTrailer(remaining);
    parsedObjects.push([table, trailer]);
  }

  return parsedObjects;
};

class PDFCrossReferenceParser {
  parse = (data: Uint8Array): [XRef.Table, PDFTrailer][] => {
    const xrefOffset = parseXRefOffset(data);
    const parsedObjects = parseAllXRefTables(data, xrefOffset);
    return parsedObjects;
  };
}

export default PDFCrossReferenceParser;
