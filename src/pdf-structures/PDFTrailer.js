/* @flow */
import dedent from 'dedent';
import { charCodes } from '../utils';

import PDFDictionary from '../pdf-objects/PDFDictionary';

class PDFTrailer {
  dictionary: PDFDictionary;
  offset: number;

  constructor(dictionary: PDFDictionary, offset: number) {
    if (!(dictionary instanceof PDFDictionary)) {
      throw new Error('PDFTrailer dictionaries can only be PDFDictionaries');
    }
    if (typeof offset !== 'number') {
      throw new Error('PDFTrailers offsets only be Numbers');
    }

    this.dictionary = dictionary;
    this.offset = offset;
  }

  toString = () => dedent`
    trailer
    ${this.dictionary}
    startxref
    ${this.offset}
    %%EOF

  `;

  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFTrailer;
