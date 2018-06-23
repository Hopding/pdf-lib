/* tslint:disable:max-classes-per-file class-name */
import isNil from 'lodash/isNil';

import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer, or } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Set the colour to use for stroking operations in a device, CIE-based
 * (other than ICCBased), or Indexed colour space. The number of operands required
 * and their interpretation depends on the current stroking colour space:
 *
 * For DeviceGray, CalGray, and Indexed colour spaces, one operand shall be
 * required (n = 1).
 *
 * For DeviceRGB, CalRGB, and Lab colour spaces, three operands shall be
 * required (n = 3).
 *
 * For DeviceCMYK, four operands shall be required (n = 4).
 */
export class SC extends PDFOperator {
  static of = (...c: number[]) => new SC(...c);

  c: [number, number, number, number];

  // TODO: The number of operands required here depends on the current
  // color space. So shouldn't really be restricting it to just 4 numbers.
  constructor(...c: number[]) {
    super();
    validate(c[0], isNumber, 'SC operator args "c" must be a number.');
    validate(
      c[1],
      or(isNumber, isNil),
      'SC operator args "c" must be a number.',
    );
    validate(
      c[2],
      or(isNumber, isNil),
      'SC operator args "c" must be a number.',
    );
    validate(
      c[3],
      or(isNumber, isNil),
      'SC operator args "c" must be a number.',
    );
    this.c = c as [number, number, number, number];
  }

  toString = (): string => `${this.c.join(' ')} SC\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
 * Same as SC but used for nonstroking operations.
 */
export class sc extends PDFOperator {
  static of = (...c: number[]) => new sc(...c);

  c: [number, number, number, number];

  // TODO: The number of operands required here depends on the current
  // color space. So shouldn't really be restricting it to just 4 numbers.
  constructor(...c: number[]) {
    super();
    validate(c[0], isNumber, 'sc operator args "c" must be a number.');
    validate(
      c[1],
      or(isNumber, isNil),
      'sc operator args "c" must be a number.',
    );
    validate(
      c[2],
      or(isNumber, isNil),
      'sc operator args "c" must be a number.',
    );
    validate(
      c[3],
      or(isNumber, isNil),
      'sc operator args "c" must be a number.',
    );
    this.c = c as [number, number, number, number];
  }

  toString = (): string => `${this.c.join(' ')} sc\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}
