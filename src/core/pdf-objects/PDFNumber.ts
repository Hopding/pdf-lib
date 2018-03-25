import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

import PDFObject from './PDFObject';

class PDFNumber extends PDFObject {
  public static fromNumber = (num: number) => new PDFNumber(num);
  public static fromString = (numberStr: string) =>
    new PDFNumber(Number(numberStr));

  public number: number;

  constructor(num: number) {
    super();
    validate(num, _.isNumber, 'Can only construct PDFNumbers from Numbers');
    this.number = num;
  }

  public toString = (): string => this.number.toString();

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFNumber;
