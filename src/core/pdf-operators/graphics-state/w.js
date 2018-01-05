/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isNumber } from '../../../utils/validate';

/**
Set the line width in the graphics state
*/
class w extends PDFOperator {
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

  static of = (lineWidth: number) => new w(lineWidth);

  toString = (): string => `${this.lineWidth} w\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default w;
