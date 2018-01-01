/* @flow */
import _ from 'lodash';

import PDFObject from './PDFObject';
import { addStringToBuffer } from '../utils';
import { validate } from '../utils/validate';

class PDFNumber extends PDFObject {
  number: number;

  constructor(number: number) {
    super();
    validate(number, _.isNumber, 'Can only construct PDFNumbers from Numbers');
    this.number = number;
  }

  static fromNumber = (number: number) => new PDFNumber(number);
  static fromString = (numberStr: string) => new PDFNumber(Number(numberStr));

  toString = () => this.number.toString();

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFNumber;
