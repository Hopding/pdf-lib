import { PDFArray, PDFDictionary, PDFName } from 'core/pdf-objects';
import pako from 'pako';

const decodeStream = (data: Uint8Array, { key: filter }: PDFName) => {
  if (filter === 'FlateDecode') return pako.inflate(data);

  // TODO: Implement support for all other filter types
  if (filter === 'DCTDecode') return data;

  throw new Error(`Unknown stream filter type: ${filter}`);
};

export default (dict: PDFDictionary, contents: Uint8Array) => {
  const filters = dict.get('Filter');
  if (filters) {
    const filtersArr = filters instanceof PDFArray ? filters.array : [filters];
    return filtersArr.reduce(decodeStream, contents);
  }
  return contents;
};
