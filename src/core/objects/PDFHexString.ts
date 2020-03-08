import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';
import {
  copyStringIntoBuffer,
  toHexStringOfMinLength,
  utf16Decode,
  utf16Encode,
} from 'src/utils';
import { pdfDocEncodingDecode } from 'src/utils/pdfdocencoding';

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
    // Append a zero if the number of digits is odd. See pdf spec 7.3.4.3
    if (value.length % 2 === 1) {
      value = value + '0';
    }

    const bytes: number[] = [];
    let i = 0;
    while (i + 2 <= value.length) {
      // Get the next two digits
      const nextTwoDigits = value.substr(i, 2);
      i = i + 2;

      // Hex is base 16
      bytes.push(parseInt(nextTwoDigits, 16));
    }

    if (value.toUpperCase().startsWith('FEFF')) {
      // Leading Byte Order Mark (in HEX) means it is an UTF-16BE encoded string.
      // See pdf spec figure 7.
      return utf16Decode(new Uint16Array(bytes));
    }
    return pdfDocEncodingDecode(new Uint16Array(bytes));
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
