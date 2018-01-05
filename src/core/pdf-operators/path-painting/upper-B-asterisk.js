/* @flow */
/* eslint-disable new-cap, camelcase */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const BAsterisk_ENFORCER = Symbol('BAsterisk_ENFORCER');

/**
Fill and then stroke the path, using the even-odd rule to determine the region
to fill. This operator shall produce the same result as B, except that the path
is filled as if with f* instead of f.
*/
class BAsterisk extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(BAsterisk_ENFORCER),
      'Cannot instantiate PDFOperator.BAsterisk - use "BAsterisk.operator" instead',
    );
  }

  static operator = new BAsterisk(BAsterisk_ENFORCER);

  toString = () => `B*\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default BAsterisk;
