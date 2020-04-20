import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';
import {
  copyStringIntoBuffer,
  // hexStringToBytes,
  toHexStringOfMinLength,
  utf16Decode,
  utf16Encode,
  pdfDocEncodingDecode,
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

  private readonly value: string;

  constructor(value: string) {
    super();
    this.value = value;
  }

  asBytes(): Uint8Array {
    // Append a zero if the number of digits is odd. See PDF spec 7.3.4.3
    const hex = this.value + (this.value.length % 2 === 1 ? '0' : '');
    const hexLength = hex.length;

    const bytes = new Uint8Array(hex.length / 2);

    // // Interpret each pair of hex digits as a single byte
    // for (let idx = 0, len = hex.length; idx < len; idx += 2) {
    //   const byte = parseInt(hex.substring(idx, idx + 2), 16);
    //   bytes[idx / 2] = byte;
    // }

    let hexOffset = 0;
    let bytesOffset = 0;

    // Interpret each pair of hex digits as a single byte
    while (hexOffset < hexLength) {
      const byte = parseInt(hex.substring(hexOffset, hexOffset + 2), 16);
      bytes[bytesOffset] = byte;

      hexOffset += 2;
      bytesOffset += 1;
    }

    return bytes;
  }

  decodeText(): string {
    const bytes = this.asBytes();

    // Leading Byte Order Mark means it is a UTF-16BE encoded string.
    if (bytes[0] === 0xfe && bytes[1] === 0xff) {
      return utf16Decode(bytes);
    }

    return pdfDocEncodingDecode(bytes);
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
