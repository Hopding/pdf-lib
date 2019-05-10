import { CharCodes } from 'src/core/enums';
import { charFromCode } from 'src/utils';

class PDFHeader {
  static forVersion = (major: number, minor: number) =>
    new PDFHeader(major, minor);

  private readonly major: string;
  private readonly minor: string;

  private constructor(major: number, minor: number) {
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
    const initialOffset = offset;

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

    return offset - initialOffset;
  }
}

export default PDFHeader;
