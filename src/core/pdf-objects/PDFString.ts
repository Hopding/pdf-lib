import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

import PDFObject from './PDFObject';

class PDFString extends PDFObject {
  public string: string;

  constructor(string: string) {
    super();
    validate(string, _.isString, 'Can only construct PDFStrings from Strings');
    this.string = string;
  }

  public static fromString = (string: string) => new PDFString(string);

  public toString = (): string => `(${this.string})`;

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

export default PDFString;
