/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer, and } from 'utils';
import { isInRange, isNumber, validate } from 'utils/validate';

/**
Set the stroking colour space to DeviceGray (or the DefaultGray colour space)
and set the gray level to use for stroking operations. gray shall be a number
between 0.0 (black) and 1.0 (white).
*/
export class G extends PDFOperator {
  public gray: number;

  constructor(gray: number) {
    super();
    validate(
      gray,
      and(isNumber, isInRange(0.0, 0.1)),
      'G operator arg "gray" must be a number.',
    );
    this.gray = gray;
  }

  public static of = (gray: number) => new G(gray);

  public toString = (): string => `${this.gray} G\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

/**
Same as G but used for nonstroking operations.
*/
export class g extends PDFOperator {
  public gray: number;

  constructor(gray: number) {
    super();
    validate(gray, isNumber, 'g operator arg "gray" must be a number.');
    this.gray = gray;
  }

  public static of = (gray: number) => new g(gray);

  public toString = (): string => `${this.gray} g\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}
