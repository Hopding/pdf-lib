/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validateArr } from 'utils/validate';

/**
 * Append a cubic Bézier curve to the current path.
 * The curve shall extend from the current point to the point (x3, y3),
 *  using (x1, y1) and (x3, y3) as the Bézier control points.
 * The new current point shall be (x3, y3).
 */
class y extends PDFOperator {
  static of = (x1: number, y1: number, x3: number, y3: number) =>
    new y(x1, y1, x3, y3);

  x1: number;
  y1: number;
  x3: number;
  y3: number;

  constructor(x1: number, y1: number, x3: number, y3: number) {
    super();
    validateArr(
      [x1, y1, x3, y3],
      isNumber,
      'y operator args "x1 y1 x3 y3" must all be numbers.',
    );
    this.x1 = x1;
    this.y1 = y1;
    this.x3 = x3;
    this.y3 = y3;
  }

  toString = (): string => `${this.x1} ${this.y1} ${this.x3} ${this.y3} y\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default y;
