/* @flow */
import { charCodes } from '../utils';

import PDFObject from './PDFObject';

class PDFBoolean extends PDFObject {
  boolean: boolean;

  constructor(boolean: boolean) {
    super();
    if (typeof boolean !== 'boolean') {
      throw new Error('Can only construct PDFBooleans from Booleans');
    }
    this.boolean = boolean;
  }

  static fromBool = (bool: boolean) => new PDFBoolean(bool);
  static fromString = (boolStr: string) => new PDFBoolean(Boolean(boolStr));

  toString = () => this.boolean.toString();
  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFBoolean;
