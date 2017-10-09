/* @flow */
import { charCodes } from '../utils';
import PDFObject from './PDFObject';

class PDFNull extends PDFObject {
  fromNull = () => new PDFNull();
  toString = () => 'null';
  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFNull;
