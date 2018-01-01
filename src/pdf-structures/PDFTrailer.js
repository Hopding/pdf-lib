/* @flow */
import dedent from 'dedent';
import _ from 'lodash';
import { addStringToBuffer } from '../utils';
import { validate, isInstance } from '../utils/validate';

import PDFDictionary from '../pdf-objects/PDFDictionary';

class PDFTrailer {
  offset: number;
  dictionary: PDFDictionary;

  constructor(offset: number, dictionary: PDFDictionary) {
    validate(offset, _.isNumber, 'PDFTrailer offsets can only be Numbers');
    validate(
      dictionary,
      isInstance(PDFDictionary),
      'PDFTrailer dictionaries can only be PDFDictionaries',
    );

    this.offset = offset;
    this.dictionary = dictionary;
  }

  static from = (offset: number, dictionary: PDFDictionary) =>
    new PDFTrailer(offset, dictionary);

  toString = () => dedent`
    trailer
    ${this.dictionary}
    startxref
    ${this.offset}
    %%EOF
  `;

  bytesSize = () =>
    8 + // "trailer\n"
    this.dictionary.bytesSize() +
    1 + // "\n"
    10 + // "startxref\n"
    String(this.offset).length +
    1 + // "\n"
    5; // "%%EOF\n"

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

export default PDFTrailer;
