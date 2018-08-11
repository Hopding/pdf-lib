import add from 'lodash/add';
import flatten from 'lodash/flatten';
import last from 'lodash/last';
import tail from 'lodash/tail';

import { PDFObjectIndex } from 'core/pdf-document';
import {
  PDFDictionary,
  PDFIndirectObject,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import { addStringToBuffer, or } from 'utils';
import { isInstance, validate, validateArr } from 'utils/validate';

class PDFObjectStream extends PDFStream {
  static create = (index: PDFObjectIndex, objects: PDFIndirectObject[]) =>
    new PDFObjectStream(
      new PDFDictionary({ Type: PDFName.from('ObjStm') }, index),
      objects,
    );

  static from = (dictionary: PDFDictionary, objects: PDFIndirectObject[]) =>
    new PDFObjectStream(dictionary, objects);

  objects: PDFIndirectObject[];

  constructor(dictionary: PDFDictionary, objects: PDFIndirectObject[]) {
    super(dictionary);
    validateArr(
      objects,
      isInstance(PDFIndirectObject),
      'PDFObjectStream.objects must be an array of PDFIndirectObject',
    );
    this.objects = objects;
  }

  objectByteOffsets = (): number[] =>
    tail(this.objects).reduce(
      (offsets, obj) => offsets.concat(last(offsets)! + obj.bytesSize()),
      [0],
    );

  leadingIntegerPairs = (): Array<[number, number]> => {
    const byteOffsets = this.objectByteOffsets();
    return this.objects.map(
      (obj, idx) =>
        [obj.reference.objectNumber, byteOffsets[idx]] as [number, number],
    );
  };

  updateDictionary = () => {
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
      PDFNumber.fromNumber(
        flatten(this.leadingIntegerPairs()).join(' ').length,
      ),
    );
  };

  contentBytesSize = (): number =>
    flatten(this.leadingIntegerPairs()).join(' ').length +
    this.objects.map((obj) => obj.bytesSize()).reduce(add, 0);

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
    remaining = addStringToBuffer(
      flatten(this.leadingIntegerPairs()).join(' '),
      remaining,
    );

    remaining = this.objects.reduce(
      (remBytes: Uint8Array, obj: PDFIndirectObject) =>
        obj.pdfObject.copyBytesInto(remBytes),
      remaining,
    );

    remaining = addStringToBuffer('\nendstream', remaining);
    return remaining;
  };
}

export default PDFObjectStream;
