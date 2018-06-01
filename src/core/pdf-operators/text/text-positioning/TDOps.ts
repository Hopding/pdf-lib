/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Move to the start of the next line, offset from the start of the current line by
 * (tx, ty). tx and ty shall denote numbers expressed in unscaled text space units.
 * More precisely, this operator shall perform these assignments:
 *              |1   0   0|
 * T_m = T_lm = |0   1   0| × T_lm
 *              |t_x t_y 1|
 */
export class Td extends PDFOperator {
  static of = (tx: number, ty: number) => new Td(tx, ty);

  tx: number;
  ty: number;

  constructor(tx: number, ty: number) {
    super();
    validate(tx, isNumber, 'Td operator arg "tx" must be a number.');
    validate(ty, isNumber, 'Td operator arg "ty" must be a number.');
    this.tx = tx;
    this.ty = ty;
  }

  toString = (): string => `${this.tx} ${this.ty} Td\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
 * Move to the start of the next line, offset from the start of the current line by
 * (tx, ty). As a side effect, this operator shall set the leading parameter in the
 * text state. This operator shall have the same effect as this code:
 * −ty TL
 * tx ty Td
 */
export class TD extends PDFOperator {
  static of = (tx: number, ty: number) => new TD(tx, ty);

  tx: number;
  ty: number;

  constructor(tx: number, ty: number) {
    super();
    validate(tx, isNumber, 'TD operator arg "tx" must be a number.');
    validate(ty, isNumber, 'TD operator arg "ty" must be a number.');
    this.tx = tx;
    this.ty = ty;
  }

  toString = (): string => `${this.tx} ${this.ty} TD\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}
