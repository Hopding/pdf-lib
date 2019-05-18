import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';
import { copyStringIntoBuffer } from 'src/utils';

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
    buffer[offset++] = CharCodes.LessThan;
    offset += copyStringIntoBuffer(this.value, buffer, offset);
    buffer[offset++] = CharCodes.GreaterThan;
    return this.value.length + 2;
  }
}

export default PDFHexString;
