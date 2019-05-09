import { numberToString } from 'src/utils/index';

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

  clone(): PDFNumber {
    return PDFNumber.of(this.numberValue);
  }

  toString(): string {
    return this.stringValue;
  }

  sizeInBytes(): number {
    return this.stringValue.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): void {
    for (let idx = 0, len = this.stringValue.length; idx < len; idx++) {
      buffer[offset++] = this.stringValue.charCodeAt(idx);
    }
  }
}

export default PDFNumber;
