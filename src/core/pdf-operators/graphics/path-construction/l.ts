/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * (lowercase L) Append a straight line segment from the current point to the
 * point (x, y). The new current point shall be (x, y).
 */
class l extends PDFOperator {
  public static of = (x: number, y: number) => new l(x, y);

  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    super();
    validate(x, isNumber, 'l operator arg "x" must be a number.');
    validate(y, isNumber, 'l operator arg "y" must be a number.');
    this.x = x;
    this.y = y;
  }

  public toString = (): string => `${this.x} ${this.y} l\n`;

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default l;
