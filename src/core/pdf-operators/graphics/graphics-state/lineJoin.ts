/* @flow */
/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { validate, oneOf } from 'utils/validate';

/**
Set the line join style in the graphics state
*/
class j extends PDFOperator {
  lineJoin: number;

  constructor(lineJoin: number) {
    super();
    validate(
      lineJoin,
      oneOf(0, 1, 2),
      'j operator arg "lineJoin" must be 0, 1, or 2.',
    );
    this.lineJoin = lineJoin;
  }

  static of = (lineJoin: number) => new j(lineJoin);

  toString = (): string => `${this.lineJoin} j\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default j;
