/* @flow */
import { charCodes } from '../utils';
import PDFObject from './PDFObject';

class PDFString extends PDFObject {
  string: string;

  constructor(string: string) {
    super();
    if (typeof string !== 'string') {
      throw new Error('Can only construct PDFStrings from Strings');
    }
    this.string = string;
  }

  static fromString = (string: string) => new PDFString(string);

  toString = () => `(${this.string})`;
  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFString;
