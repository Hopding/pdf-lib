/* @flow */
/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { and, addStringToBuffer } from 'utils';
import { validate, isNumber, isInRange } from 'utils/validate';

/**
Set the stroking colour space to DeviceCMYK (or the DefaultCMYK colour space and
set the colour to use for stroking operations. Each operand shall be a number
between 0.0 (zero concentration) and 1.0 (maximum concentration). The behaviour
of this operator is affected by the overprint mode.
*/
export class K extends PDFOperator {
  c: number;
  y: number;
  m: number;
  k: number;

  constructor(c: number, m: number, y: number, k: number) {
    super();
    validate(
      c,
      and(isNumber, isInRange(0.0, 1.1)),
      'K operator arg "c" must be a number between 0.0 and 1.0.',
    );
    validate(
      m,
      and(isNumber, isInRange(0.0, 1.1)),
      'K operator arg "y" must be a number between 0.0 and 1.0.',
    );
    validate(
      y,
      and(isNumber, isInRange(0.0, 1.1)),
      'K operator arg "m" must be a number between 0.0 and 1.0.',
    );
    validate(
      k,
      and(isNumber, isInRange(0.0, 1.1)),
      'K operator arg "k" must be a number between 0.0 and 1.0.',
    );
    this.c = c;
    this.m = m;
    this.y = y;
    this.k = k;
  }

  static of = (c: number, m: number, y: number, k: number) => new K(c, m, y, k);

  toString = (): string => `${this.c} ${this.y} ${this.m} ${this.k} K\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
Same as K but used for nonstroking operations.
*/
export class k extends PDFOperator {
  c: number;
  y: number;
  m: number;
  k: number;

  constructor(c: number, m: number, y: number, key: number) {
    super();
    validate(
      c,
      and(isNumber, isInRange(0.0, 1.1)),
      'k operator arg "c" must be a number between 0.0 and 1.0.',
    );
    validate(
      m,
      and(isNumber, isInRange(0.0, 1.1)),
      'k operator arg "y" must be a number between 0.0 and 1.0.',
    );
    validate(
      y,
      and(isNumber, isInRange(0.0, 1.1)),
      'k operator arg "m" must be a number between 0.0 and 1.0.',
    );
    validate(
      key,
      and(isNumber, isInRange(0.0, 1.1)),
      'k operator arg "key" must be a number between 0.0 and 1.0.',
    );
    this.c = c;
    this.m = m;
    this.y = y;
    this.k = key;
  }

  static of = (c: number, m: number, y: number, key: number) =>
    new k(c, m, y, key);

  toString = (): string => `${this.c} ${this.y} ${this.m} ${this.k} k\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}
