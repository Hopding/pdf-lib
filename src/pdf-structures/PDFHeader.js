/* @flow */
import dedent from 'dedent';
import { arrayToString, charCodes, charCode } from '../utils';

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

  toBytes = (): Uint8Array => {
    const bytes = [...charCodes(`%PDF-${this.major}.${this.minor}\n`)];
    bytes.push(charCode('%'), 130, 130, 130, 130, charCode('\n'));
    return new Uint8Array(bytes);
  };
}

export default PDFHeader;
