/* @flow */
import { addStringToBuffer, charCodes } from '../utils';
import PDFObject from './PDFObject';

class PDFNull extends PDFObject {
  static fromNull = () => new PDFNull();

  toString = () => 'null';
  bytesSize = () => 4;
  addBytes = (buffer: Uint8Array): Uint8Array => addStringToBuffer('null', buffer);
  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFNull;
