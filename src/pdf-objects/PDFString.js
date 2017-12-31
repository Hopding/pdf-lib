/* @flow */
import { addStringToBuffer, charCodes } from '../utils';
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
  bytesSize = () => this.toString().length;
  addBytes = (buffer: Uint8Array): Uint8Array => addStringToBuffer(this.toString(), buffer);
  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFString;
