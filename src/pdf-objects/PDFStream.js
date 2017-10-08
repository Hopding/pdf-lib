/* @flow */
import dedent from 'dedent';
import { mergeUint8Arrays, charCodes } from '../utils';

import PDFObject from './PDFObject';
import PDFDictionary from './PDFDictionary';

class PDFStream extends PDFObject {
  dictionary: PDFDictionary;
  content: Uint8Array;

  constructor(
    dictionary: PDFDictionary = new PDFDictionary(),
    content: Uint8Array,
  ) {
    super();
    if (!(dictionary instanceof PDFDictionary)) {
      throw new Error('PDFStreams require PDFDictionary to be constructed');
    }
  }

  toBytes = () => {
    /* eslint-disable */
    const dictArr = new Uint8Array(charCodes(dedent`
      ${this.dictionary}
      stream
    ` + '\n'));
    /* eslint-enable */
    return mergeUint8Arrays(
      dictArr,
      this.content,
      new Uint8Array(charCodes('endstream\n')),
    );
  };
}

export default PDFStream;
