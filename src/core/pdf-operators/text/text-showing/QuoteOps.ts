/* tslint:disable:max-classes-per-file class-name */
import isString from 'lodash/isString';

import { PDFHexString, PDFString } from 'core/pdf-objects/index';
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer, or } from 'utils';
import { isInstance, isNumber, validate } from 'utils/validate';

/**
 * Move to the next line and show a text string.
 * This operator shall have the same effect as the code:
 * T*
 * string Tj
 */
export class SingleQuote extends PDFOperator {
  static of = (str: PDFString | PDFHexString | string) => new SingleQuote(str);

  string: PDFString | PDFHexString;

  constructor(str: PDFString | PDFHexString | string) {
    super();
    validate(
      str,
      or(isInstance(PDFString), isInstance(PDFHexString), isString),
      '\' operator arg "string" must be one of: PDFString, PDFHexString, String',
    );
    this.string = isString(str) ? PDFString.fromString(str) : str;
  }

  toString = (): string => `${this.string.toString()} '\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
 * Move to the next line and show a text string, using aw as the word spacing
 * and ac as the character spacing (setting the corresponding parameters in the
 * text state). aw and ac shall be numbers expressed in unscaled text space units.
 * This operator shall have the same effect as this code:
 * aw Tw
 * ac Tc
 * string '
 */
export class DoubleQuote extends PDFOperator {
  static of = (
    aw: number,
    ac: number,
    str: PDFString | PDFHexString | string,
  ) => new DoubleQuote(aw, ac, str);

  aw: number;
  ac: number;
  string: PDFString | PDFHexString;

  constructor(aw: number, ac: number, str: PDFString | PDFHexString | string) {
    super();
    validate(aw, isNumber, '" operator arg "aw" must be a Number');
    validate(ac, isNumber, '" operator arg "ac" must be a Number');
    validate(
      str,
      or(isInstance(PDFString), isInstance(PDFHexString), isString),
      '" operator arg "string" must be one of: PDFString, PDFHexString, String',
    );

    this.aw = aw;
    this.ac = ac;
    this.string = isString(str) ? PDFString.fromString(str) : str;
  }

  toString = (): string =>
    `${this.aw} ${this.ac} ${this.string.toString()} "\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}
