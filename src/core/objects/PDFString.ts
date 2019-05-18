import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';

class PDFString extends PDFObject {
  // The PDF spec allows newlines and parens to appear directly within a literal
  // string. These character _may_ be escaped. But they do not _have_ to be. So
  // for simplicity, we will not bother escaping them.
  static of = (value: string) => new PDFString(value);

  private readonly value: string;

  private constructor(value: string) {
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

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    const length = this.value.length;
    buffer[offset++] = CharCodes.LeftParen;
    for (let idx = 0; idx < length; idx++) {
      buffer[offset++] = this.value.charCodeAt(idx);
    }
    buffer[offset++] = CharCodes.RightParen;
    return length + 2;
  }
}

export default PDFString;
