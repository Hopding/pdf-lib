import isString from 'lodash/isString';

import { addStringToBuffer } from 'utils';
import { doesMatch, validate } from 'utils/validate';

import PDFObject from './PDFObject';

// TODO: We have to support whitespace characters in hex strings when parsing,
// but maybe we should remove them when serializing?
const HEX_STRING_REGEX = /^[\dABCDEFabcdef\0\t\n\f\r ]*$/;

class PDFHexString extends PDFObject {
  static fromString = (str: string) => new PDFHexString(str);

  string: string;

  constructor(str: string) {
    super();
    validate(str, isString, 'PDFHexString.string must be a String');
    validate(
      str,
      doesMatch(HEX_STRING_REGEX),
      `Invalid characters in hex string: "${str}"`,
    );
    this.string = str;
  }

  toString = (): string => `<${this.string}>`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFHexString;
