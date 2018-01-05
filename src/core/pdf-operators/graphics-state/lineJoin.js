/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isNumber } from '../../../utils/validate';

/**
Set the line join style in the graphics state
*/
class j extends PDFOperator {
  lineJoin: number;

  constructor(lineJoin: number) {
    super();
    validate(lineJoin, isNumber, 'j operator arg "lineJoin" must be a number.');
    this.lineJoin = lineJoin;
  }

  static of = (lineJoin: number) => new j(lineJoin);

  toString = (): string => `${this.lineJoin} j\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default j;
