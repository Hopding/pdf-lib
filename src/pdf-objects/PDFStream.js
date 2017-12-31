/* @flow */
import pako from 'pako';
import dedent from 'dedent';
import { mergeUint8Arrays, charCodes } from '../utils';

import PDFObject from './PDFObject';
import PDFDictionary from './PDFDictionary';

class PDFStream extends PDFObject {
  dictionary: PDFDictionary;
  content: Uint8Array | string;
  encoded: boolean;
  locked: boolean = false;

  constructor(
    dictionary: PDFDictionary = new PDFDictionary(),
    content?: Uint8Array,
    encoded?: boolean,
  ) {
    super();
    if (!(dictionary instanceof PDFDictionary)) {
      throw new Error('PDFStreams require PDFDictionary to be constructed');
    }
    if (content) this.locked = true;

    this.dictionary = dictionary;
    this.content = content || '';
    this.encoded = encoded || false;
  }

  toString = () => `<${this.content.length} bytes>`;

  toBytes = (): Uint8Array => {
    /* eslint-disable */
    const dictArr = new Uint8Array(charCodes(dedent`
      ${this.dictionary}
      stream
    ` + '\n'));
    /* eslint-enable */
    return mergeUint8Arrays(
      dictArr,
      typeof this.content === 'string'
        ? new Uint8Array(charCodes(`${this.content}`))
        : this.content,
      new Uint8Array(charCodes('\nendstream')),
    );
  };
}

export default PDFStream;
