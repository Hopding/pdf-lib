import add from 'lodash/add';
import dropRight from 'lodash/dropRight';
import flatten from 'lodash/flatten';
import last from 'lodash/last';
import max from 'lodash/max';
import padStart from 'lodash/padStart';
import sum from 'lodash/sum';

import { PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectObject,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import { addStringToBuffer, bytesFor, digits, or, sizeInBytes } from 'utils';
import { isInstance, validate, validateArr } from 'utils/validate';

class PDFXRefStream extends PDFStream {
  static create = (index: PDFObjectIndex) =>
    new PDFXRefStream(new PDFDictionary({ Type: PDFName.from('XRef') }, index));

  private entries: Array<[number, number, number]> = [];

  constructor(dictionary: PDFDictionary) {
    super(dictionary);
  }

  addFreeObjectEntry = (nextFreeObjectNum: number, generationNum: number) => {
    this.entries.push([0, nextFreeObjectNum, generationNum]);
  };

  addUncompressedObjectEntry = (byteOffset: number, generationNum: number) => {
    this.entries.push([1, byteOffset, generationNum]);
  };

  addCompressedObjectEntry = (objectStreamNum: number, index: number) => {
    this.entries.push([2, objectStreamNum, index]);
  };

  bytesSize = (): number => {
    this.updateDictionary();
    return (
      this.dictionary.bytesSize() +
      1 + // "\n"
      7 + // "stream\n"
      this.entriesBytesSize() +
      10 // \nendstream
    );
  };

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    this.updateDictionary();
    this.validateDictionary();

    let remaining = this.dictionary.copyBytesInto(buffer);
    remaining = addStringToBuffer('\nstream\n', remaining);
    remaining = this.copyEntryBytesInto(remaining);
    remaining = addStringToBuffer('\nendstream', remaining);
    return remaining;
  };

  private copyEntryBytesInto = (buffer: Uint8Array): Uint8Array => {
    const entryWidths = this.maxEntryByteWidths();

    let idx = 0;
    flatten(this.entries).forEach((entry, currEntryIdx) => {
      const bytes = bytesFor(entry).reverse();
      for (let i = entryWidths[currEntryIdx % 3] - 1; i >= 0; i--) {
        buffer[idx++] = bytes[i] || 0;
      }
    });

    return buffer.subarray(idx);
  };

  private entriesBytesSize = (): number =>
    sum(this.maxEntryByteWidths()) * this.entries.length;

  private maxEntryByteWidths = (): [number, number, number] => [
    sizeInBytes(max(this.entries.map(([x]) => x))!),
    sizeInBytes(max(this.entries.map(([, x]) => x))!),
    sizeInBytes(max(this.entries.map(([, , x]) => x))!),
  ];

  private updateDictionary = () => {
    this.dictionary.set(
      PDFName.from('W'),
      PDFArray.fromArray(
        this.maxEntryByteWidths().map(PDFNumber.fromNumber),
        this.dictionary.index,
      ),
    );
    this.dictionary.set(
      PDFName.from('Length'),
      PDFNumber.fromNumber(this.entriesBytesSize()),
    );
  };
}

export default PDFXRefStream;
