/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { and, addStringToBuffer } from '../../../utils';
import { validate, isNumber, isInRange } from '../../../utils/validate';

/**
Set the stroking colour space to DeviceGray (or the DefaultGray colour space)
and set the gray level to use for stroking operations. gray shall be a number
between 0.0 (black) and 1.0 (white).
*/
export class G extends PDFOperator {
  gray: number;

  constructor(gray: number) {
    super();
    validate(
      gray,
      and(isNumber, isInRange(0.0, 0.1)),
      'G operator arg "gray" must be a number.',
    );
    this.gray = gray;
  }

  static of = (gray: number) => new G(gray);

  toString = (): string => `${this.gray} G\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
Same as G but used for nonstroking operations.
*/
export class g extends PDFOperator {
  gray: number;

  constructor(gray: number) {
    super();
    validate(gray, isNumber, 'g operator arg "gray" must be a number.');
    this.gray = gray;
  }

  static of = (gray: number) => new g(gray);

  toString = (): string => `${this.gray} g\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}
