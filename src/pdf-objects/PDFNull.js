/* @flow */
import { addStringToBuffer, charCodes } from '../utils';
import PDFObject from './PDFObject';

class PDFNull extends PDFObject {
  static fromNull = () => new PDFNull();

  toString = () => 'null';
  bytesSize = () => 4;
  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer('null', buffer);
}

export default PDFNull;
