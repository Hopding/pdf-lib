/* @flow */
import pako from 'pako';
import { writeToDebugFile } from '../../utils';
import { PDFObject, PDFName, PDFArray } from '../../pdf-objects';

const decodeStream = (data: Uint8Array, { key: filter }: PDFName) => {
  if (filter === 'FlateDecode') return pako.inflate(data);

  // TODO: Implement support for these filters
  if (filter === 'DCTDecode') return data;

  throw new Error(`Unknown stream filter type: ${filter}`);
};

export default (dict: Map<string, PDFObject>, contents: Uint8Array) => {
  const filters = dict.get('Filter');
  if (filters) {
    const filtersArr = filters instanceof PDFArray ? filters.array : [filters];
    return filtersArr.reduce(decodeStream, contents);
  }
  return contents;
};
