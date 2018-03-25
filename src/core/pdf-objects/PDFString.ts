import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { validate } from 'utils/validate';

import PDFObject from './PDFObject';

class PDFString extends PDFObject {
  public static fromString = (str: string) => new PDFString(str);

  public string: string;

  constructor(str: string) {
    super();
    validate(str, _.isString, 'Can only construct PDFStrings from Strings');
    this.string = str;
  }

  public toString = (): string => `(${this.string})`;

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFString;
