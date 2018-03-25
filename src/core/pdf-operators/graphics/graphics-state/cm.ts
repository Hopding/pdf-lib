/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validateArr } from 'utils/validate';

/**
Modify the current transformation matrix (CTM) by concatenating the specified
matrix. Although the operands specify a matrix, they shall be written as six
separate numbers, not as an array.
*/
class cm extends PDFOperator {
  public a: number;
  public b: number;
  public c: number;
  public d: number;
  public e: number;
  public f: number;

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

  public static of = (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ) => new cm(a, b, c, d, e, f)

  public toString = (): string =>
    `${this.a} ${this.b} ${this.c} ${this.d} ${this.e} ${this.f} cm\n`

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

export default cm;
