/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { isNumber, validate } from 'utils/validate';

/**
 * Set the text leading, Tl, to leading, which shall be a number expressed in
 * unleading text space units. Text leading shall be used only by the T*, ', and "
 * operators. Initial value: 0.
 */
class TL extends PDFOperator {
  public static of = (leading: number) => new TL(leading);

  public leading: number;

  constructor(leading: number) {
    super();
    validate(leading, isNumber, 'TL operator arg "leading" must be a number.');
    this.leading = leading;
  }

  public toString = (): string => `${this.leading} TL\n`;

  public bytesSize = () => this.toString().length;

  public copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default TL;
