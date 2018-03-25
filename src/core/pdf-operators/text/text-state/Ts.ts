/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Set the text rise, Tsise, to rise, which shall be a number expressed in unscaled
 * text space units. Initial value: 0.
 */
class Ts extends PDFOperator {
  static of = (rise: number) => new Ts(rise);

  rise: number;

  constructor(rise: number) {
    super();
    validate(rise, isNumber, 'Ts operator arg "rise" must be a number.');
    this.rise = rise;
  }

  toString = (): string => `${this.rise} Ts\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default Ts;
