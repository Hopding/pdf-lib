import isFinite from 'lodash/isFinite';
import isString from 'lodash/isString';

import { addStringToBuffer } from 'utils';
import { numberToString } from 'utils/numbers';
import { validate } from 'utils/validate';

import PDFObject from './PDFObject';

class PDFNumber extends PDFObject {
  static fromNumber = (num: number) => new PDFNumber(num);

  static fromString = (numberStr: string) => {
    validate(
      numberStr,
      isString,
      'PDFNumber.fromString requires a string as a parameter.',
    );
    return new PDFNumber(Number(numberStr));
  };

  number: number;

  constructor(num: number) {
    super();
    validate(num, isFinite, 'Can only construct PDFNumbers from Numbers');
    this.number = num;
  }

  clone = () => PDFNumber.fromNumber(this.number);

  toString = (): string => numberToString(this.number);

  bytesSize = () => numberToString(this.number).length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFNumber;
