/* tslint:disable:max-classes-per-file class-name */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isInRange, validate } from 'utils/validate';

/**
 * Set the flatness tolerance in the graphics state.
 * flatness is a number in the * range 0 to 100; a value of 0 shall specify the
 *   output device’s default flatness tolerance.
 */
class i extends PDFOperator {
  static of = (flatness: number) => new i(flatness);

  flatness: number;

  constructor(flatness: number) {
    super();
    validate(
      flatness,
      isInRange(0, 100),
      'i operator arg "flatness" must be a number from 0 to 100.',
    );
    this.flatness = flatness;
  }

  toString = () => `${this.flatness} i\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default i;
