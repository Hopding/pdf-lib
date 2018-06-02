/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validateArr } from 'utils/validate';

/**
 * Modify the current transformation matrix (CTM) by concatenating the specified
 * matrix. Although the operands specify a matrix, they shall be written as six
 * separate numbers, not as an array.
 */
class cm extends PDFOperator {
  static of = (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) => new cm(a, b, c, d, e, f);

  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;

  constructor(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) {
    super();
    validateArr(
      [a, b, c, d, e, f],
      isNumber,
      'cm operator args "a, b, c, d, e, f" must be all be numbers.',
    );
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
  }

  toString = () =>
    `${this.a} ${this.b} ${this.c} ${this.d} ${this.e} ${this.f} cm\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default cm;
