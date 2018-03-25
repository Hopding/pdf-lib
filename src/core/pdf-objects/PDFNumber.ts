import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

import PDFObject from './PDFObject';

class PDFNumber extends PDFObject {
  public number: number;

  constructor(number: number) {
    super();
    validate(number, _.isNumber, 'Can only construct PDFNumbers from Numbers');
    this.number = number;
  }

  public static fromNumber = (number: number) => new PDFNumber(number);
  public static fromString = (numberStr: string) =>
    new PDFNumber(Number(numberStr))

  public toString = (): string => this.number.toString();

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

export default PDFNumber;
