/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Set the character spacing, Tc, to charSpace, which shall be a number
 *   expressed in unscaled text space units.
 * Character spacing shall be used by the Tj, TJ, and ' operators.
 * Initial value: 0.
 */
class Tc extends PDFOperator {
  static of = (charSpace: number) => new Tc(charSpace);

  charSpace: number;

  constructor(charSpace: number) {
    super();
    validate(
      charSpace,
      isNumber,
      'Tc operator arg "charSpace" must be a number.',
    );
    this.charSpace = charSpace;
  }

  toString = () => `${this.charSpace} Tc\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default Tc;
