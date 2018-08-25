import isNil from 'lodash/isNil';
import isNumber from 'lodash/isNumber';

import { addStringToBuffer, or } from 'utils';
import { isInstance, validate } from 'utils/validate';

import { PDFDictionary } from 'core/pdf-objects';

class PDFTrailer {
  static from = (offset: number, dictionary?: PDFDictionary) =>
    new PDFTrailer(offset, dictionary);

  offset: number;
  dictionary: PDFDictionary | void;

  constructor(offset: number, dictionary?: PDFDictionary) {
    validate(offset, isNumber, 'PDFTrailer.offset must be a number');
    validate(
      dictionary,
      or(isNil, isInstance(PDFDictionary)),
      'PDFTrailer.dictionary must be instance of PDFDictionary or undefined',
    );

    this.offset = offset;
    this.dictionary = dictionary;
  }

  toString = (): string =>
    (this.dictionary ? `trailer\n${this.dictionary.toString()}\n` : '') +
    `startxref\n` +
    `${this.offset}\n` +
    `%%EOF\n`;

  bytesSize = () =>
    (this.dictionary
      ? 8 /* "trailer\n" */ + this.dictionary.bytesSize() + 1 /* "\n" */
      : 0) +
    10 + // "startxref\n"
    String(this.offset).length +
    1 + // "\n"
    6; // "%%EOF\n"

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    let remaining = buffer;
    if (this.dictionary) {
      remaining = addStringToBuffer('trailer\n', remaining);
      remaining = this.dictionary.copyBytesInto(remaining);
      remaining = addStringToBuffer('\n', remaining);
    }
    remaining = addStringToBuffer(
      `startxref\n${this.offset}\n%%EOF\n`,
      remaining,
    );
    return remaining;
  };
}

export default PDFTrailer;
