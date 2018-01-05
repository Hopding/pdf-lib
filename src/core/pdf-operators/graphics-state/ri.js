/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isNumber } from '../../../utils/validate';

/**
Set the colour rendering intent in the graphics state
*/
class ri extends PDFOperator {
  // TODO: Check in the space... This probably isn't a number
  intent: number;

  constructor(intent: number) {
    super();
    validate(intent, isNumber, 'ri operator arg "intent" must be a number.');
    this.intent = intent;
  }

  static of = (intent: number) => new ri(intent);

  toString = (): string => `${this.intent} ri\n`;

  bytesSize = (): number => this.toString().length;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default ri;
