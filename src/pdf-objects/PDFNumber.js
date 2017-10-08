/* @flow */
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

  toString = this.number.toString;
}

export default PDFNumber;
