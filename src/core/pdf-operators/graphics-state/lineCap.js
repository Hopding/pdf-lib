/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isNumber } from '../../../utils/validate';

/**
Set the line cap style in the graphics state
*/
class J extends PDFOperator {
  lineCap: number;

  constructor(lineCap: number) {
    super();
    validate(lineCap, isNumber, 'J operator arg "lineCap" must be a number.');
    this.lineCap = lineCap;
  }

  static of = (lineCap: number) => new J(lineCap);

  toString = (): string => `${this.lineCap} J\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default J;
