/* @flow */
import { charCodes, charCode } from '../utils';
import PDFObject from './PDFObject';

const pdfNameEnforcer = Symbol('PDF_NAME_ENFORCER');
const pdfNamePool: Map<string, PDFName> = new Map();

class PDFName extends PDFObject {
  key: string;

  constructor(enforcer: Symbol, key: string) {
    super();
    if (enforcer !== pdfNameEnforcer) {
      throw new Error('Cannot create PDFName via constructor');
    }

    if (key.charAt(0) === ' ') {
      throw new Error('PDF Name objects may not begin with a space character.');
    }
    this.key = key;
  }

  static isRegularChar = char =>
    charCode(char) >= charCode('!') && charCode(char) <= charCode('~');

  static forString = (str: string): PDFName => {
    if (typeof str !== 'string') {
      throw new Error('PDFName.forString() requires string as argument');
    }

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

  toBytes = (): Uint8Array => new Uint8Array(charCodes(this.toString()));
}

export default PDFName;
