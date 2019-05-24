import { copyStringIntoBuffer, numberToString } from 'src/utils/index';

import PDFObject from 'src/core/objects/PDFObject';

class PDFNumber extends PDFObject {
  static of = (value: number) => new PDFNumber(value);

  private readonly numberValue: number;
  private readonly stringValue: string;

  private constructor(value: number) {
    super();
    this.numberValue = value;
    this.stringValue = numberToString(value);
  }

  value(): number {
    return this.numberValue;
  }

  clone(): PDFNumber {
    return PDFNumber.of(this.numberValue);
  }

  toString(): string {
    return this.stringValue;
  }

  sizeInBytes(): number {
    return this.stringValue.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    offset += copyStringIntoBuffer(this.stringValue, buffer, offset);
    return this.stringValue.length;
  }
}

export default PDFNumber;
