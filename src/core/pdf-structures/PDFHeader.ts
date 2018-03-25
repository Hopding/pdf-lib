import _ from 'lodash';
import { addStringToBuffer, charCode } from 'utils';
import { validate } from 'utils/validate';

class PDFHeader {
  public static forVersion = (major: number, minor: number) =>
    new PDFHeader(major, minor);

  public major: number;
  public minor: number;

  constructor(major: number, minor: number) {
    validate(major, _.isNumber, 'PDFHeader.major must be a Number');
    validate(minor, _.isNumber, 'PDFHeader.minor must be a Number');

    this.major = major;
    this.minor = minor;
  }

  public toString = (): string => `
    %PDF-${this.major}.${this.minor}
    %<COMMENT_WITH_BINARY_CHARACTERS>
  `;

  public bytesSize = () => `%PDF-${this.major}.${this.minor}\n`.length + 6;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array => {
    const remaining = addStringToBuffer(
      `%PDF-${this.major}.${this.minor}\n`,
      buffer,
    );
    remaining.set([charCode('%'), 130, 130, 130, 130, charCode('\n')], 0);
    return remaining.subarray(6);
  };
}

export default PDFHeader;
