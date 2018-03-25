import _ from 'lodash';

import { addStringToBuffer, toBoolean } from 'utils';
import { validate } from 'utils/validate';

import PDFObject from './PDFObject';

class PDFBoolean extends PDFObject {
  public boolean: boolean;

  constructor(boolean: boolean) {
    super();
    validate(
      boolean,
      _.isBoolean,
      'Can only construct PDFBooleans from Booleans',
    );
    this.boolean = boolean;
  }

  public static fromBool = (bool: boolean) => new PDFBoolean(bool);
  public static fromString = (boolStr: string) =>
    new PDFBoolean(toBoolean(boolStr))

  public toString = (): string => this.boolean.toString();
  public bytesSize = () => this.toString().length;
  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

export default PDFBoolean;
