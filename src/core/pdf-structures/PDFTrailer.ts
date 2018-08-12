import isNumber from 'lodash/isNumber';

import { addStringToBuffer } from 'utils';
import { isInstance, validate } from 'utils/validate';

import PDFDictionary from '../pdf-objects/PDFDictionary';

class PDFTrailer {
  static from = (offset: number, dictionary: PDFDictionary) =>
    new PDFTrailer(offset, dictionary);

  offset: number;
  dictionary: PDFDictionary;

  constructor(offset: number, dictionary: PDFDictionary) {
    validate(offset, isNumber, 'PDFTrailer offsets can only be Numbers');
    validate(
      dictionary,
      isInstance(PDFDictionary),
      'PDFTrailer dictionaries can only be PDFDictionaries',
    );

    this.offset = offset;
    this.dictionary = dictionary;
  }

  toString = (): string =>
    `trailer\n` +
    `${this.dictionary.toString()}\n` +
    `startxref\n` +
    `${this.offset}\n` +
    `%%EOF\n`;

  bytesSize = () =>
    8 + // "trailer\n"
    this.dictionary.bytesSize() +
    1 + // "\n"
    10 + // "startxref\n"
    String(this.offset).length +
    1 + // "\n"
    6; // "%%EOF\n"

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = addStringToBuffer('trailer\n', buffer);
    remaining = this.dictionary.copyBytesInto(remaining);
    remaining = addStringToBuffer(
      `\nstartxref\n${this.offset}\n%%EOF\n`,
      remaining,
    );
    return remaining;
  };
}

/* tslint:disable max-classes-per-file */
// TODO: Cleanup and unit test this!
export class PDFTrailerX {
  static from = (offset: number) => new PDFTrailerX(offset);

  offset: number;

  constructor(offset: number) {
    validate(offset, isNumber, 'PDFTrailer offsets can only be Numbers');
    this.offset = offset;
  }

  toString = (): string => `startxref\n` + `${this.offset}\n` + `%%EOF\n`;

  bytesSize = () =>
    10 + // "startxref\n"
    String(this.offset).length +
    1 + // "\n"
    6; // "%%EOF\n"

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(`startxref\n${this.offset}\n%%EOF\n`, buffer);
}

export default PDFTrailer;
