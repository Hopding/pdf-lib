import { CharCodes } from 'src/core/enums';
import PDFObject from 'src/core/objects/PDFObject';

class PDFString extends PDFObject {
  static of = (value: string) => new PDFString(value);

  private readonly value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  clone(): PDFString {
    return PDFString.of(this.value);
  }

  toString(): string {
    return `(${this.value})`;
  }

  sizeInBytes(): number {
    return this.value.length + 2;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): void {
    buffer[offset++] = CharCodes.LeftParen;
    for (let idx = 0, len = this.value.length; idx < len; idx++) {
      buffer[offset++] = this.value.charCodeAt(idx);
    }
    buffer[offset++] = CharCodes.RightParen;
  }
}

export default PDFString;
