import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { doesMatch, validate } from 'utils/validate';

import PDFObject from './PDFObject';

const HEX_STRING_REGEX = /^[\dABCDEFabcdef]*/;

class PDFHexString extends PDFObject {
  public string: string;

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

  public static fromString = (string: string) => new PDFHexString(string);

  public toString = (): string => `<${this.string}>`;

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

export default PDFHexString;
