import flatten from 'lodash/flatten';
import max from 'lodash/max';
import sum from 'lodash/sum';
import pako from 'pako';

import { PDFObjectIndex } from 'core/pdf-document';
import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFStream,
} from 'core/pdf-objects';
import { PDFCatalog } from 'core/pdf-structures';
import { addStringToBuffer, bytesFor, reverseArray, sizeInBytes } from 'utils';

class PDFXRefStream extends PDFStream {
  static create = (
    config: { Size: PDFNumber; Root: PDFIndirectReference<PDFCatalog> },
    index: PDFObjectIndex,
  ) => new PDFXRefStream(config, index);

  private entries: Array<[number, number, number]> = [];
  private encodedEntries: Uint8Array | void;

  constructor(
    { Size, Root }: { Size: PDFNumber; Root: PDFIndirectReference<PDFCatalog> },
    index: PDFObjectIndex,
  ) {
    super(new PDFDictionary({ Type: PDFName.from('XRef'), Size, Root }, index));
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

  encode = () => {
    this.dictionary.set(PDFName.from('Filter'), PDFName.from('FlateDecode'));
    const buffer = new Uint8Array(this.entriesBytesSize());
    this.copyEntryBytesInto(buffer);
    this.encodedEntries = pako.deflate(buffer);
    return this;
  };

  bytesSize = (): number => {
    this.updateDictionary();
    return (
      this.dictionary.bytesSize() +
      1 + // "\n"
      7 + // "stream\n"
      this.contentBytesSize() +
      10 // \nendstream
    );
  };

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    this.updateDictionary();
    this.validateDictionary();

    let remaining = this.dictionary.copyBytesInto(buffer);
    remaining = addStringToBuffer('\nstream\n', remaining);

    if (this.encodedEntries) {
      for (let i = 0; i < this.encodedEntries.length; i++) {
        remaining[i] = this.encodedEntries[i];
      }
      remaining = remaining.subarray(this.encodedEntries.length);
    } else {
      remaining = this.copyEntryBytesInto(remaining);
    }

    remaining = addStringToBuffer('\nendstream', remaining);
    return remaining;
  };

  private contentBytesSize = () =>
    this.encodedEntries ? this.encodedEntries.length : this.entriesBytesSize();

  private copyEntryBytesInto = (buffer: Uint8Array): Uint8Array => {
    const entryWidths = this.maxEntryByteWidths();

    let idx = 0;
    flatten(this.entries).forEach((entry, currEntryIdx) => {
      const bytes = reverseArray(bytesFor(entry));
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
      PDFNumber.fromNumber(this.contentBytesSize()),
    );
  };
}

export default PDFXRefStream;
