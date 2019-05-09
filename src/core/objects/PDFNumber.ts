import { numberToString } from 'src/utils';

import PDFObject from 'src/core/objects/PDFObject';

class PDFNumber extends PDFObject {
  static of = (value: number) => new PDFNumber(value);

  private readonly value: number;

  private constructor(value: number) {
    super();
    this.value = value;
  }

  clone(): PDFNumber {
    return PDFNumber.of(this.value);
  }

  toString(): string {
    return numberToString(this.value);
  }

  sizeInBytes(): number {
    return this.toString().length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number) {
    const valueAsString = this.toString();
    for (let idx = 0, len = valueAsString.length; idx < len; idx++) {
      buffer[offset + idx] = valueAsString.charCodeAt(idx);
    }
  }
}

export default PDFNumber;
