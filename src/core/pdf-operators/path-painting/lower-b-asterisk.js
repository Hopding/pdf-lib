/* @flow */
/* eslint-disable new-cap, camelcase */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const bAsterisk_ENFORCER = Symbol('bAsterisk_ENFORCER');

/**
Close, fill, and then stroke the path, using the even-odd rule to determine the
region to fill. This operator shall have the same effect as the sequence h B*.
*/
class bAsterisk extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(bAsterisk_ENFORCER),
      'Cannot instantiate PDFOperator.bAsterisk - use "bAsterisk.operator" instead',
    );
  }

  static operator = new bAsterisk(bAsterisk_ENFORCER);

  toString = () => `b*\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default bAsterisk;
