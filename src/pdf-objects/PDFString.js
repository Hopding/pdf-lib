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
  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFString;
