/* @flow */
/* eslint-disable new-cap, camelcase */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const fAsterisk_ENFORCER = Symbol('fAsterisk_ENFORCER');

/**
Fill the path, using the even-odd rule to determine the region to fill.
*/
class fAsterisk extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(fAsterisk_ENFORCER),
      'Cannot instantiate PDFOperator.fAsterisk - use "fAsterisk.operator" instead',
    );
  }

  static operator = new fAsterisk(fAsterisk_ENFORCER);

  toString = () => `f*\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default fAsterisk;
