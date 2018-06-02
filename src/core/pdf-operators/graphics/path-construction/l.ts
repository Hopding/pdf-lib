/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * (lowercase L) Append a straight line segment from the current point to the
 *   point (x, y).
 * The new current point shall be (x, y).
 */
class l extends PDFOperator {
  static of = (x: number, y: number) => new l(x, y);

  x: number;
  y: number;

  constructor(x: number, y: number) {
    super();
    validate(x, isNumber, 'l operator arg "x" must be a number.');
    validate(y, isNumber, 'l operator arg "y" must be a number.');
    this.x = x;
    this.y = y;
  }

  toString = () => `${this.x} ${this.y} l\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default l;
