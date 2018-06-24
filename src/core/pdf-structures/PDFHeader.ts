import isNumber from 'lodash/isNumber';

import { addStringToBuffer, charCode } from 'utils';
import { validate } from 'utils/validate';

class PDFHeader {
  static forVersion = (major: number, minor: number) =>
    new PDFHeader(major, minor);

  major: number;
  minor: number;

  constructor(major: number, minor: number) {
    validate(major, isNumber, 'PDFHeader.major must be a Number');
    validate(minor, isNumber, 'PDFHeader.minor must be a Number');

    this.major = major;
    this.minor = minor;
  }

  toString = (): string => `%PDF-${this.major}.${this.minor}\n`;

  bytesSize = () => `%PDF-${this.major}.${this.minor}\n`.length + 6;

  copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    const remaining = addStringToBuffer(
      `%PDF-${this.major}.${this.minor}\n`,
      buffer,
    );
    remaining.set([charCode('%'), 130, 130, 130, 130, charCode('\n')], 0);
    return remaining.subarray(6);
  };
}

export default PDFHeader;
