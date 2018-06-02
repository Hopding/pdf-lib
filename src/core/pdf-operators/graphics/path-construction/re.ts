/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Append a rectangle to the current path as a complete subpath, with lower-left
 *   corner (x, y) and dimensions width and height in user space.
 * The operation `x y width height re` is equivalent to
 * ```
 * x y m
 * (x + width) y l
 * (x + width) (y + height) l
 * x (y + height) l
 * h
 * ```
 */
class re extends PDFOperator {
  static of = (x: number, y: number, width: number, height: number) =>
    new re(x, y, width, height);

  x: number;
  y: number;
  width: number;
  height: number;

  constructor(x: number, y: number, width: number, height: number) {
    super();
    validate(x, isNumber, 're operator arg "x" must be a number.');
    validate(y, isNumber, 're operator arg "y" must be a number.');
    validate(width, isNumber, 're operator arg "width" must be a number.');
    validate(height, isNumber, 're operator arg "height" must be a number.');
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  toString = () => `${this.x} ${this.y} ${this.width} ${this.height} re\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default re;
