/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
Begin a new subpath by moving the current point to coordinates (x, y), omitting
any connecting line segment. If the previous path construction operator in the
current path was also m, the new m overrides it; no vestige of the previous m
operation remains in the path.
*/
class m extends PDFOperator {
  public x: number;
  public y: number;

  constructor(x: number, y: number) {
    super();
    validate(x, isNumber, 'm operator arg "x" must be a number.');
    validate(y, isNumber, 'm operator arg "y" must be a number.');
    this.x = x;
    this.y = y;
  }

  public static of = (x: number, y: number) => new m(x, y);

  public toString = (): string => `${this.x} ${this.y} m\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

export default m;
