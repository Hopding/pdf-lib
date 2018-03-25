
import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

import PDFObject from './PDFObject';

class PDFString extends PDFObject {
  string: string;

  constructor(string: string) {
    super();
    validate(string, _.isString, 'Can only construct PDFStrings from Strings');
    this.string = string;
  }

  static fromString = (string: string) => new PDFString(string);

  toString = (): string => `(${this.string})`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFString;
