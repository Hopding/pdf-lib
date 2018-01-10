/* @flow */
import _ from 'lodash';

import PDFObject from './PDFObject';
import { addStringToBuffer } from 'utils';
import { validate, doesMatch } from 'utils/validate';

const HEX_STRING_REGEX = /^[\dABCDEFabcdef]*/;

class PDFHexString extends PDFObject {
  string: string;

  constructor(string: string) {
    super();
    validate(string, _.isString, 'PDFHexString.string must be a String');
    validate(
      string,
      doesMatch(HEX_STRING_REGEX),
      `Invalid characters in hex string: "${string}"`,
    );
    this.string = string;
  }

  static fromString = (string: string) => new PDFHexString(string);

  toString = (): string => `<${this.string}>`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFHexString;
