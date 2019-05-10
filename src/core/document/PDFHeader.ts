import { CharCodes } from 'src/core/enums';
import { charFromCode } from 'src/utils';

class PDFHeader {
  static forVersion = (major: number, minor: number) =>
    new PDFHeader(major, minor);

  readonly major: string;
  readonly minor: string;

  constructor(major: number, minor: number) {
    this.major = String(major);
    this.minor = String(minor);
  }

  toString(): string {
    const bc = charFromCode(129);
    return `%PDF-${this.major}.${this.minor}\n%${bc}${bc}${bc}${bc}`;
  }

  sizeInBytes(): number {
    return 12 + this.major.length + this.minor.length;
  }

  copyBytesInto(buffer: Uint8Array, offset: number): number {
    buffer[offset++] = CharCodes.Percent;
    buffer[offset++] = CharCodes.P;
    buffer[offset++] = CharCodes.D;
    buffer[offset++] = CharCodes.F;
    buffer[offset++] = CharCodes.Dash;
    for (let idx = 0, len = this.major.length; idx < len; idx++) {
      buffer[offset++] = this.major.charCodeAt(idx);
    }
    buffer[offset++] = CharCodes.Period;
    for (let idx = 0, len = this.minor.length; idx < len; idx++) {
      buffer[offset++] = this.minor.charCodeAt(idx);
    }
    buffer[offset++] = CharCodes.Newline;
    buffer[offset++] = CharCodes.Percent;
    buffer[offset++] = 129;
    buffer[offset++] = 129;
    buffer[offset++] = 129;
    buffer[offset++] = 129;

    return 12 + this.major.length + this.minor.length;
  }
}

export default PDFHeader;
