/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validateArr } from 'utils/validate';

/**
 * Set the text matrix, Tm, and the text line matrix, T_lm:
 *              |a b 0|
 * T_m = T_lm = |c d 0|
 *              |e f 1|
 * The operands shall all be numbers, and the initial value for Tm and Tlm shall be
 * the identity matrix, [1 0 0 1 0 0]. Although the operands specify a matrix, they
 * shall be passed to Tm as six separate numbers, not as an array. The matrix
 * specified by the operands shall not be concatenated onto the current text
 * matrix, but shall replace it.
 */
class Tm extends PDFOperator {
  static of = (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) => new Tm(a, b, c, d, e, f);

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
      'Tm operator args "a b c d e f" must all be numbers.',
    );
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
  }

  toString = (): string =>
    `${this.a} ${this.b} ${this.c} ${this.d} ${this.e} ${this.f} Tm\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default Tm;
