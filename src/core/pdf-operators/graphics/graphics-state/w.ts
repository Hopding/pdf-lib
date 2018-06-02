/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Set the line width in the graphics state
 */
class w extends PDFOperator {
  static of = (lineWidth: number) => new w(lineWidth);

  lineWidth: number;

  constructor(lineWidth: number) {
    super();
    validate(
      lineWidth,
      isNumber,
      'w operator arg "lineWidth" must be a number.',
    );
    this.lineWidth = lineWidth;
  }

  toString = () => `${this.lineWidth} w\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default w;
