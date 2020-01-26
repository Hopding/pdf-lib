import { PDFArray, PDFNumber } from 'src/core';

class PDFRectangle {
  static fromArray(array: PDFArray) {
    return new PDFRectangle(array);
  }

  readonly array: PDFArray;

  protected constructor(array: PDFArray) {
    this.array = array;
  }

  setRectangle(x: number, y: number, width: number, height: number) {
    this.array.set(0, PDFNumber.of(x));
    this.array.set(1, PDFNumber.of(y));
    this.array.set(2, PDFNumber.of(x + width));
    this.array.set(3, PDFNumber.of(y + height));
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
