import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';
import {
  copyStringIntoBuffer,
  toHexStringOfMinLength,
  utf16Encode,
} from 'src/utils';

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

  private readonly stringValue: string;

  constructor(value: string) {
    super();
    this.stringValue = value;
  }

  value(): string {
    return this.stringValue;
  }

  clone(): PDFHexString {
    return PDFHexString.of(this.stringValue);
  }

  toString(): string {
    return `<${this.stringValue}>`;
  }

  sizeInBytes(): number {
    return this.stringValue.length + 2;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    buffer[offset++] = CharCodes.LessThan;
    offset += copyStringIntoBuffer(this.stringValue, buffer, offset);
    buffer[offset++] = CharCodes.GreaterThan;
    return this.stringValue.length + 2;
  }
}

export default PDFHexString;
