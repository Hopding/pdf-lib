import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';
import {
  copyStringIntoBuffer,
  hexStringToBytes,
  toHexStringOfMinLength,
  utf16Decode,
  utf16Encode,
} from 'src/utils';
import { PDFDocEncoding } from 'src/utils/PDFDocEncoding';

class PDFHexString extends PDFObject {
  static of = (value: string) => new PDFHexString(value);

  static fromText = (value: string) => {
    const encoded = utf16Encode(value);

    let hex = '';
    for (let idx = 0, len = encoded.length; idx < len; idx++) {
      hex += toHexStringOfMinLength(encoded[idx], 4);
    }

    return new PDFHexString(hex);
  };

  static toText = (value: string) => {
    const bytes = hexStringToBytes(value);

    if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
      // Leading Byte Order Mark means it is an UTF-16BE encoded string.
      return utf16Decode(new Uint16Array(bytes));
    }
    return PDFDocEncoding.decode(bytes);
  };

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

  decodeText(): string {
    return PDFHexString.toText(this.value);
  }
}

export default PDFHexString;
