/* @flow */
import _ from 'lodash';

import PDFObject from './PDFObject';
import { and, addStringToBuffer, charCode } from '../../utils';
import { validate, isIdentity, isNotIdentity } from '../../utils/validate';

const pdfNameEnforcer = Symbol('PDF_NAME_ENFORCER');
const pdfNamePool: Map<string, PDFName> = new Map();

class PDFName extends PDFObject {
  key: string;

  constructor(enforcer: Symbol, key: string) {
    super();
    validate(
      enforcer,
      isIdentity(pdfNameEnforcer),
      'Cannot create PDFName via constructor',
    );
    validate(
      key.charAt(0),
      and(isNotIdentity(' '), isNotIdentity('/')),
      'PDF Name objects may not begin with a space character.',
    );
    this.key = key;
  }

  static isRegularChar = (char: string) =>
    charCode(char) >= charCode('!') && charCode(char) <= charCode('~');

  static from = (str: string): PDFName => {
    validate(str, _.isString, 'PDFName.from() requires string as argument');

    if (str.charCodeAt(0) === '/') console.log(`str: "${str.charCodeAt(0)}"`);

    let pdfName = pdfNamePool.get(str);
    if (!pdfName) {
      pdfName = new PDFName(pdfNameEnforcer, str);
      pdfNamePool.set(str, pdfName);
    }
    return pdfName;
  };

  toString = () =>
    `/${this.key}`
      .replace('#', '#23')
      .split('')
      .map(
        char =>
          PDFName.isRegularChar(char)
            ? char
            : `#${charCode(char).toString(16)}`,
      )
      .join('');

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default PDFName;
