/* @flow */
/* eslint-disable new-cap */
import _ from 'lodash';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import { PDFString, PDFHexString } from 'core/pdf-objects/index';

import { or, addStringToBuffer } from 'utils';
import { validate, isInstance, isNumber } from 'utils/validate';

/**
Move to the next line and show a text string.
This operator shall have the same effect as the code:
T*
string Tj
*/
export class SingleQuote extends PDFOperator {
  string: PDFString | PDFHexString;

  constructor(string: PDFString | PDFHexString | string) {
    super();
    validate(
      string,
      or(isInstance(PDFString), isInstance(PDFHexString), _.isString),
      '\' operator arg "string" must be one of: PDFString, PDFHexString, String',
    );
    // TODO: Fix these suppressions
    if (_.isString(string)) {
      // $SuppressFlow
      this.string = PDFString.fromString(string);
      // $SuppressFlow
    } else this.string = string;
  }

  static of = (string: PDFString | PDFHexString | string) =>
    new SingleQuote(string);

  toString = (): string => `${this.string.toString()} '\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
Move to the next line and show a text string, using aw as the word spacing
and ac as the character spacing (setting the corresponding parameters in the
text state). aw and ac shall be numbers expressed in unscaled text space units.
This operator shall have the same effect as this code:
aw Tw
ac Tc
string '
*/
export class DoubleQuote extends PDFOperator {
  aw: number;
  ac: number;
  string: PDFString | PDFHexString;

  constructor(
    aw: number,
    ac: number,
    string: PDFString | PDFHexString | string,
  ) {
    super();
    validate(aw, isNumber, '" operator arg "aw" must be a Number');
    validate(ac, isNumber, '" operator arg "ac" must be a Number');
    validate(
      string,
      or(isInstance(PDFString), isInstance(PDFHexString), _.isString),
      '" operator arg "string" must be one of: PDFString, PDFHexString, String',
    );
    // TODO: Fix these suppressions...
    if (_.isString(string)) {
      // $SuppressFlow
      this.string = PDFString.fromString(string);
      // $SuppressFlow
    } else this.string = string;
  }

  static of = (
    aw: number,
    ac: number,
    string: PDFString | PDFHexString | string,
  ) => new DoubleQuote(aw, ac, string);

  toString = (): string =>
    `${this.aw} ${this.ac} ${this.string.toString()} "\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}
