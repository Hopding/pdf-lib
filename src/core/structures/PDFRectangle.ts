import { PDFArray, PDFNumber } from 'src/core';

class PDFRectangle {
  static fromArray(array: PDFArray) {
    return new PDFRectangle(array);
  }

  readonly array: PDFArray;

  protected constructor(array: PDFArray) {
    this.array = array;
  }

  lowerLeftX(): number {
    return this.array.lookup(0, PDFNumber).value();
  }

  lowerLeftY(): number {
    return this.array.lookup(1, PDFNumber).value();
  }

  upperRightX(): number {
    return this.array.lookup(2, PDFNumber).value();
  }

  upperRightY(): number {
    return this.array.lookup(3, PDFNumber).value();
  }
}

export default PDFRectangle;
