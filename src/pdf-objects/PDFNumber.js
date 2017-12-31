/* @flow */
import { addStringToBuffer, charCodes } from '../utils';
import PDFObject from './PDFObject';

class PDFNumber extends PDFObject {
  number: number;

  constructor(number: number) {
    super();
    if (typeof number !== 'number') {
      throw new Error('Can only construct PDFNumbers from Numbers');
    }
    this.number = number;
  }

  static fromNumber = (number: number) => new PDFNumber(number);
  static fromString = (numberStr: string) => new PDFNumber(Number(numberStr));

  toString = () => this.number.toString();
  bytesSize = () => this.toString().length;
  addBytes = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFNumber;
