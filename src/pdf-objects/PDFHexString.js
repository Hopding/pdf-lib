/* @flow */
import { addStringToBuffer, charCodes } from '../utils';
import PDFObject from './PDFObject';

const hexStringRegex = /^[\dABCDEFabcdef]*/;
class PDFHexString extends PDFObject {
  string: string;

  constructor(string: string) {
    super();
    if (typeof string !== 'string') {
      throw new Error('Can only construct PDFHexStrings from Strings');
    }
    if (!string.match(hexStringRegex)) {
      throw new Error(`Invalid characters in hex string: "${string}"`);
    }
    this.string = string;
  }

  static fromString = (string: string) => new PDFHexString(string);

  toString = () => `<${this.string}>`;
  bytesSize = () => this.toString().length;
  addBytes = (buffer: Uint8Array): Uint8Array => addStringToBuffer(this.toString(), buffer);
  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFHexString;
