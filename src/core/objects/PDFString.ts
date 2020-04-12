import PDFObject from 'src/core/objects/PDFObject';
import CharCodes from 'src/core/syntax/CharCodes';
import { copyStringIntoBuffer, padStart } from 'src/utils';

class PDFString extends PDFObject {
  // The PDF spec allows newlines and parens to appear directly within a literal
  // string. These character _may_ be escaped. But they do not _have_ to be. So
  // for simplicity, we will not bother escaping them.
  static of = (value: string) => new PDFString(value);

  static fromDate = (date: Date) => {
    const year = padStart(String(date.getUTCFullYear()), 4, '0');
    const month = padStart(String(date.getUTCMonth() + 1), 2, '0');
    const day = padStart(String(date.getUTCDate()), 2, '0');
    const hours = padStart(String(date.getUTCHours()), 2, '0');
    const mins = padStart(String(date.getUTCMinutes()), 2, '0');
    const secs = padStart(String(date.getUTCSeconds()), 2, '0');
    return new PDFString(`D:${year}${month}${day}${hours}${mins}${secs}Z`);
  };

  private readonly stringValue: string;

  private constructor(value: string) {
    super();
    this.stringValue = value;
  }

  value(): string {
    return this.stringValue;
  }

  clone(): PDFString {
    return PDFString.of(this.stringValue);
  }

  toString(): string {
    return `(${this.stringValue})`;
  }

  sizeInBytes(): number {
    return this.stringValue.length + 2;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    buffer[offset++] = CharCodes.LeftParen;
    offset += copyStringIntoBuffer(this.stringValue, buffer, offset);
    buffer[offset++] = CharCodes.RightParen;
    return this.stringValue.length + 2;
  }
}

export default PDFString;
