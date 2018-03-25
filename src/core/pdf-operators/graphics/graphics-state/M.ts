/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Set the miter limit in the graphics state
 */
class M extends PDFOperator {
  public static of = (miterLimit: number) => new M(miterLimit);

  public miterLimit: number;

  constructor(miterLimit: number) {
    super();
    validate(
      miterLimit,
      isNumber,
      'j operator arg "miterLimit" must be a number.',
    );
    this.miterLimit = miterLimit;
  }

  public toString = (): string => `${this.miterLimit} M\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default M;
