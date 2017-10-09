/* @flow */
import dedent from 'dedent';
import { charCodes } from '../utils';

import PDFDictionary from '../pdf-objects/PDFDictionary';

class PDFTrailer {
  offset: number;
  dictionary: PDFDictionary;

  constructor(offset: number, dictionary: PDFDictionary) {
    if (typeof offset !== 'number') {
      throw new Error('PDFTrailers offsets only be Numbers');
    }
    if (!(dictionary instanceof PDFDictionary)) {
      throw new Error('PDFTrailer dictionaries can only be PDFDictionaries');
    }

    this.offset = offset;
    this.dictionary = dictionary;
  }

  toString = () => dedent`
    trailer
    ${this.dictionary}
    startxref
    ${this.offset}
    %%EOF
  `;

  toBytes = (): Uint8Array => new Uint8Array(charCodes(`${this.toString()}\n`));
}

export default PDFTrailer;
