import isBoolean from 'lodash/isBoolean';

import { addStringToBuffer, toBoolean } from 'utils';
import { validate } from 'utils/validate';

import PDFObject from './PDFObject';

class PDFBoolean extends PDFObject {
  static fromBool = (bool: boolean) => new PDFBoolean(bool);
  static fromString = (boolStr: string) => new PDFBoolean(toBoolean(boolStr));

  boolean: boolean;

  constructor(bool: boolean) {
    super();
    validate(bool, isBoolean, 'Can only construct PDFBooleans from Booleans');
    this.boolean = bool;
  }

  toString = (): string => this.boolean.toString();

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFBoolean;
