import CharCodes from 'src/core/CharCodes';
import PDFObject from 'src/core/objects/PDFObject';

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

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const length = this.value.length;
    buffer[offset++] = CharCodes.LessThan;
    for (let idx = 0; idx < length; idx++) {
      buffer[offset++] = this.value.charCodeAt(idx);
    }
    buffer[offset++] = CharCodes.GreaterThan;
    return length + 2;
  }
}

export default PDFHexString;
