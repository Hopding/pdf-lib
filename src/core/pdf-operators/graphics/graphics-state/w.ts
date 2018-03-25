/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Set the line width in the graphics state
 */
class w extends PDFOperator {
  public static of = (lineWidth: number) => new w(lineWidth);

  public lineWidth: number;

  constructor(lineWidth: number) {
    super();
    validate(
      lineWidth,
      isNumber,
      'w operator arg "lineWidth" must be a number.',
    );
    this.lineWidth = lineWidth;
  }

  public toString = (): string => `${this.lineWidth} w\n`;

  public bytesSize = (): number => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer)
}

export default w;
