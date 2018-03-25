/* eslint-disable new-cap */
import { PDFHexString, PDFString } from 'core/pdf-objects/index';
import PDFOperator from 'core/pdf-operators/PDFOperator';
import _ from 'lodash';

import { addStringToBuffer, or } from 'utils';
import { isInstance, isNumber, validate } from 'utils/validate';

/**
Move to the next line and show a text string.
This operator shall have the same effect as the code:
T*
string Tj
*/
export class SingleQuote extends PDFOperator {
  public string: PDFString | PDFHexString;

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

  public static of = (string: PDFString | PDFHexString | string) =>
    new SingleQuote(string)

  public toString = (): string => `${this.string.toString()} '\n`;

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
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
  public aw: number;
  public ac: number;
  public string: PDFString | PDFHexString;

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

  public static of = (
    aw: number,
    ac: number,
    string: PDFString | PDFHexString | string,
  ) => new DoubleQuote(aw, ac, string)

  public toString = (): string =>
    `${this.aw} ${this.ac} ${this.string.toString()} "\n`

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}
