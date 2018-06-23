import isString from 'lodash/isString';

import { addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

import PDFObject from './PDFObject';

class PDFString extends PDFObject {
  static fromString = (str: string) => new PDFString(str);

  string: string;

  constructor(str: string) {
    super();
    validate(str, isString, 'Can only construct PDFStrings from Strings');
    this.string = str;
  }

  toString = (): string =>
    `(${this.string
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')})`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFString;
