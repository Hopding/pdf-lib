/* @flow */
import _ from 'lodash';

import PDFObject from './PDFObject';
import { toBoolean, addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

class PDFBoolean extends PDFObject {
  boolean: boolean;

  constructor(boolean: boolean) {
    super();
    validate(
      boolean,
      _.isBoolean,
      'Can only construct PDFBooleans from Booleans',
    );
    this.boolean = boolean;
  }

  static fromBool = (bool: boolean) => new PDFBoolean(bool);
  static fromString = (boolStr: string) => new PDFBoolean(toBoolean(boolStr));

  toString = () => this.boolean.toString();
  bytesSize = () => this.toString().length;
  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFBoolean;
