/* @flow */
/* eslint-disable new-cap */
import PDFOperator from 'core/pdf-operators/PDFOperator';

import { addStringToBuffer } from 'utils';
import { validate, isNumber } from 'utils/validate';

/**
Set the text leading, Tl, to leading, which shall be a number expressed in
unleadingd text space units. Text leading shall be used only by the T*, ', and "
operators. Initial value: 0.
*/
class TL extends PDFOperator {
  leading: number;

  constructor(leading: number) {
    super();
    validate(leading, isNumber, 'TL operator arg "leading" must be a number.');
    this.leading = leading;
  }

  static of = (leading: number) => new TL(leading);

  toString = (): string => `${this.leading} TL\n`;

  bytesSize = () => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default TL;
