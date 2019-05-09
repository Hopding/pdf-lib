import PDFObject from 'src/core/objects/PDFObject';
import { CharCodes } from '../enums';

class PDFHexString extends PDFObject {
  static of = (value: string) => new PDFHexString(value);

  private readonly value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  clone(): PDFHexString {
    return PDFHexString.of(this.value);
  }

  toString(): string {
    return `<${this.value}>`;
  }

  sizeInBytes(): number {
    return this.value.length + 2;
  }

  copyBytesInto(buffer: Uint8Array, offset: number) {
    buffer[offset++] = CharCodes.LessThan;
    for (let idx = 0, len = this.value.length; idx < len; idx++) {
      buffer[offset++] = this.value.charCodeAt(idx);
    }
    buffer[offset++] = CharCodes.GreaterThan;
  }
}

export default PDFHexString;
