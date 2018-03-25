/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer, and } from 'utils';
import { isInRange, isNumber, validate } from 'utils/validate';

/**
 * Set the stroking colour space to DeviceRGB (or the DefaultRGB colour space) and
 * set the colour to use for stroking operations. Each operand shall be a number
 * between 0.0 (minimum intensity) and 1.0 (maximum intensity).
 */
export class RG extends PDFOperator {
  public static of = (r: number, g: number, b: number) => new RG(r, g, b);

  public r: number;
  public g: number;
  public b: number;

  constructor(r: number, g: number, b: number) {
    super();
    validate(
      r,
      and(isNumber, isInRange(0.0, 1.1)),
      'RG operator arg "r" must be a number between 0.0 and 1.0.',
    );
    validate(
      g,
      and(isNumber, isInRange(0.0, 1.1)),
      'RG operator arg "g" must be a number between 0.0 and 1.0.',
    );
    validate(
      b,
      and(isNumber, isInRange(0.0, 1.1)),
      'RG operator arg "b" must be a number between 0.0 and 1.0.',
    );
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public toString = (): string => `${this.r} ${this.g} ${this.b} RG\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

/**
 * Same as RG but used for nonstroking operations.
 */
export class rg extends PDFOperator {
  public static of = (r: number, g: number, b: number) => new rg(r, g, b);

  public r: number;
  public g: number;
  public b: number;

  constructor(r: number, g: number, b: number) {
    super();
    validate(
      r,
      and(isNumber, isInRange(0.0, 1.1)),
      'rg operator arg "r" must be a number between 0.0 and 1.0.',
    );
    validate(
      g,
      and(isNumber, isInRange(0.0, 1.1)),
      'rg operator arg "g" must be a number between 0.0 and 1.0.',
    );
    validate(
      b,
      and(isNumber, isInRange(0.0, 1.1)),
      'rg operator arg "b" must be a number between 0.0 and 1.0.',
    );
    this.r = r;
    this.g = g;
    this.b = b;
  }

  public toString = (): string => `${this.r} ${this.g} ${this.b} rg\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}
