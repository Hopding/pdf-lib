/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer, and } from 'utils';
import { isInRange, isNumber, validate } from 'utils/validate';

/**
 * Set the stroking colour space to DeviceGray (or the DefaultGray colour space)
 * and set the gray level to use for stroking operations. gray shall be a number
 * between 0.0 (black) and 1.0 (white).
 */
export class G extends PDFOperator {
  static of = (gray: number) => new G(gray);

  gray: number;

  constructor(gray: number) {
    super();
    validate(
      gray,
      and(isNumber, isInRange(0.0, 1.0)),
      'G operator arg "gray" must be a number between 0.0 and 1.0.',
    );
    this.gray = gray;
  }

  toString = (): string => `${this.gray} G\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

/**
 * Same as G but used for nonstroking operations.
 */
export class g extends PDFOperator {
  static of = (gray: number) => new g(gray);

  gray: number;

  constructor(gray: number) {
    super();
    validate(
      gray,
      and(isNumber, isInRange(0.0, 1.0)),
      'g operator arg "gray" must be a number between 0.0 and 1.0.',
    );
    this.gray = gray;
  }

  toString = (): string => `${this.gray} g\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}
