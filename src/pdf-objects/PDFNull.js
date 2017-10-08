/* @flow */
import { charCodes } from '../utils';
import PDFObject from './PDFObject';

class PDFNull extends PDFObject {
  toString = () => 'null';
  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFNull;
