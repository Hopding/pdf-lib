/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validateArr } from 'utils/validate';

/**
 * Append a cubic Bézier curve to the current path.
 * The curve shall extend from the current point to the point (x3, y3), using
 *  the current point and (x2, y2) as the Bézier control points.
 * The new current point shall be (x3, y3).
 */
class v extends PDFOperator {
  static of = (x2: number, y2: number, x3: number, y3: number) =>
    new v(x2, y2, x3, y3);

  x2: number;
  y2: number;
  x3: number;
  y3: number;

  constructor(x2: number, y2: number, x3: number, y3: number) {
    super();
    validateArr(
      [x2, y2, x3, y3],
      isNumber,
      'v operator args "x2 y2 x3 y3" must all be numbers.',
    );
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
  }

  toString = (): string => `${this.x2} ${this.y2} ${this.x3} ${this.y3} v\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default v;
