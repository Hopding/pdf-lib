/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { oneOf, validate } from 'utils/validate';

/**
 * Set the line cap style in the graphics state
 */
class J extends PDFOperator {
  static of = (lineCap: number) => new J(lineCap);

  lineCap: number;

  constructor(lineCap: number) {
    super();
    validate(
      lineCap,
      oneOf(0, 1, 2),
      'J operator arg "lineCap" must be 0, 1, or 2.',
    );
    this.lineCap = lineCap;
  }

  toString = (): string => `${this.lineCap} J\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default J;
