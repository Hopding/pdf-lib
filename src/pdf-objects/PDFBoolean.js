/* @flow */
import _ from 'lodash';
import { validate, addStringToBuffer, charCodes } from '../utils';

import PDFObject from './PDFObject';

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
  static fromString = (boolStr: string) => new PDFBoolean(Boolean(boolStr));

  toString = () => this.boolean.toString();
  bytesSize = () => this.toString().length;
  addBytes = (buffer: Uint8Array): Uint8Array => addStringToBuffer(this.toString(), buffer);
  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFBoolean;
