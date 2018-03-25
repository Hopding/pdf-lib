/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { oneOf, validate } from 'utils/validate';

/**
 * Set the line join style in the graphics state
 */
class j extends PDFOperator {
  public static of = (lineJoin: number) => new j(lineJoin);

  public lineJoin: number;

  constructor(lineJoin: number) {
    super();
    validate(
      lineJoin,
      oneOf(0, 1, 2),
      'j operator arg "lineJoin" must be 0, 1, or 2.',
    );
    this.lineJoin = lineJoin;
  }

  public toString = (): string => `${this.lineJoin} j\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

export default j;
