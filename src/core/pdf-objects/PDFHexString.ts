import _ from 'lodash';

import { addStringToBuffer } from 'utils';
import { doesMatch, validate } from 'utils/validate';

import PDFObject from './PDFObject';

const HEX_STRING_REGEX = /^[\dABCDEFabcdef]*/;

class PDFHexString extends PDFObject {
  public static fromString = (str: string) => new PDFHexString(str);

  public string: string;

  constructor(str: string) {
    super();
    validate(str, _.isString, 'PDFHexString.string must be a String');
    validate(
      str,
      doesMatch(HEX_STRING_REGEX),
      `Invalid characters in hex string: "${str}"`,
    );
    this.string = str;
  }

  public toString = (): string => `<${this.string}>`;

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFHexString;
