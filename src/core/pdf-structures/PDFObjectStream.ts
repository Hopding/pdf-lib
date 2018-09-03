import add from 'lodash/add';
import dropRight from 'lodash/dropRight';
import flatten from 'lodash/flatten';
import last from 'lodash/last';
import pako from 'pako';

import { PDFObjectIndex } from 'core/pdf-document';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFName,
  PDFNumber,
  // tslint:disable-next-line:no-unused-variable
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import { addStringToBuffer } from 'utils';
import { isInstance, validateArr } from 'utils/validate';

class PDFObjectStream extends PDFStream {
  static create = (index: PDFObjectIndex, objects: PDFIndirectObject[]) =>
    new PDFObjectStream(
      new PDFDictionary({ Type: PDFName.from('ObjStm') }, index),
      objects,
    );

  static from = (dictionary: PDFDictionary, objects: PDFIndirectObject[]) =>
    new PDFObjectStream(dictionary, objects);

  objects: PDFIndirectObject[];
  objectByteSizes: number[] = [];
  encodedContents: Uint8Array | void;

  constructor(dictionary: PDFDictionary, objects: PDFIndirectObject[]) {
    super(dictionary);
    validateArr(
      objects,
      isInstance(PDFIndirectObject),
      'PDFObjectStream.objects must be an array of PDFIndirectObject',
    );
    this.objects = objects;
  }

  encode = () => {
    this.updateObjectByteSizes();
    this.dictionary.set(PDFName.from('Filter'), PDFName.from('FlateDecode'));

    const buffer = new Uint8Array(this.contentBytesSize());
    this.copyContentBytesInto(buffer);
    this.encodedContents = pako.deflate(buffer);

    return this;
  };

  bytesSize = (): number => {
    if (this.objectByteSizes.length === 0) this.updateObjectByteSizes();
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
    if (this.objectByteSizes.length === 0) this.updateObjectByteSizes();
    this.updateDictionary();
    this.validateDictionary();

    let remaining = this.dictionary.copyBytesInto(buffer);
    remaining = addStringToBuffer('\nstream\n', remaining);

    if (this.encodedContents) {
      for (let i = 0; i < this.encodedContents.length; i++) {
        remaining[i] = this.encodedContents[i];
      }
      remaining = remaining.subarray(this.encodedContents.length);
    } else {
      remaining = this.copyContentBytesInto(remaining);
    }

    remaining = addStringToBuffer('\nendstream', remaining);
    return remaining;
  };

  private copyContentBytesInto = (buffer: Uint8Array): Uint8Array => {
    const remaining = addStringToBuffer(this.leadingIntegerPairsStr(), buffer);
    return this.objects.reduce(
      (remBytes, obj) =>
        addStringToBuffer('\n', obj.pdfObject.copyBytesInto(remBytes)),
      remaining,
    );
  };

  private updateObjectByteSizes = () => {
    // "+ 1" for the newline we add to separate the objects
    this.objectByteSizes = this.objects.map(
      (obj) => obj.pdfObject.bytesSize() + 1,
    );
  };

  private contentBytesSize = (): number =>
    this.encodedContents
      ? this.encodedContents.length
      : this.leadingIntegerPairsStr().length +
        this.objectByteSizes.reduce(add, 0);

  private leadingIntegerPairsStr = (): string =>
    flatten(this.leadingIntegerPairs()).join(' ') + '\n';

  private leadingIntegerPairs = (): Array<[number, number]> => {
    const byteOffsets = this.objectByteOffsets();
    return this.objects.map(
      (obj, idx) =>
        [obj.reference.objectNumber, byteOffsets[idx]] as [number, number],
    );
  };

  private objectByteOffsets = (): number[] => {
    const offsets = [0];
    dropRight(this.objectByteSizes).forEach((byteSize) => {
      offsets.push(last(offsets)! + byteSize);
    });
    return offsets;
  };

  private updateDictionary = () => {
    this.dictionary.set(
      PDFName.from('Length'),
      PDFNumber.fromNumber(this.contentBytesSize()),
    );
    this.dictionary.set(
      PDFName.from('N'),
      PDFNumber.fromNumber(this.objects.length),
    );
    this.dictionary.set(
      PDFName.from('First'),
      PDFNumber.fromNumber(this.leadingIntegerPairsStr().length),
    );
  };
}

export default PDFObjectStream;
