/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validateArr, isNumber } from '../../../utils/validate';

/**
Set the colour to use for stroking operations in a device, CIE-based
(other than ICCBased), or Indexed colour space. The number of operands required
and their interpretation depends on the current stroking colour space:

For DeviceGray, CalGray, and Indexed colour spaces, one operand shall be
required (n = 1).

For DeviceRGB, CalRGB, and Lab colour spaces, three operands shall be
required (n = 3).

For DeviceCMYK, four operands shall be required (n = 4).
*/
export class SC extends PDFOperator {
  c: number[];

  constructor(...c: [number, ?number, ?number, ?number]) {
    super();
    validateArr(c, isNumber, 'SC operator args "c" must be a number.');
    this.c = c;
  }

  static of = (...c: [number, ?number, ?number, ?number]) => new SC(...c);

  toString = (): string => `${this.c.join(' ')} SC\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
Same as SC but used for nonstroking operations.
*/
export class sc extends PDFOperator {
  c: number[];

  constructor(...c: [number, ?number, ?number, ?number]) {
    super();
    validateArr(c, isNumber, 'sc operator args "c" must be a number.');
    this.c = c;
  }

  static of = (...c: [number, ?number, ?number, ?number]) => new sc(...c);

  toString = (): string => `${this.c.join(' ')} sc\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}
