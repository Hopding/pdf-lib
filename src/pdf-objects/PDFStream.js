/* @flow */
import pako from 'pako';
import dedent from 'dedent';
import { addStringToBuffer, mergeUint8Arrays, charCodes } from '../utils';

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

  bytesSize = () =>
    this.dictionary.bytesSize() + 1 + 7 + this.content.length + 10;

  addBytes = (buffer: Uint8Array): Uint8Array => {
    let remaining = this.dictionary.addBytes(buffer);
    remaining = addStringToBuffer('\nstream\n', remaining);
    if (typeof this.content === 'string') {
      remaining = addStringToBuffer(this.content, remaining);
    } else {
      remaining.set(this.content, 0);
      remaining = remaining.subarray(this.content.length);
    }
    remaining = addStringToBuffer('\nendstream', remaining);
    return remaining;
  };

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
