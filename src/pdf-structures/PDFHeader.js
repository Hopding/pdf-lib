/* @flow */
import dedent from 'dedent';
import {
  addStringToBuffer,
  arrayToString,
  charCodes,
  charCode,
} from '../utils';

class PDFHeader {
  major: number;
  minor: number;

  constructor(major: number, minor: number) {
    if (typeof major !== 'number' || typeof minor !== 'number') {
      throw new Error('PDFHeaders can only be constructed from numbers');
    }
    this.major = major;
    this.minor = minor;
  }

  toString = () => dedent`
    %PDF-${this.major}.${this.minor}
    %<COMMENT_WITH_BINARY_CHARACTERS>

  `;

  bytesSize = () => `%PDF-${this.major}.${this.minor}\n`.length + 6;

  addBytes = (buffer: Uint8Array): Uint8Array => {
    const remaining = addStringToBuffer(
      `%PDF-${this.major}.${this.minor}\n`,
      buffer,
    );
    remaining.set([charCode('%'), 130, 130, 130, 130, charCode('\n')], 0);
    return remaining.subarray(6);
  };
}

export default PDFHeader;
