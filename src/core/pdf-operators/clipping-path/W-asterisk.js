/* @flow */
/* eslint-disable new-cap, camelcase */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const WAsterisk_ENFORCER = Symbol('WAsterisk_ENFORCER');

/**
Modify the current clipping path by intersecting it with the current path, using
the nonzero winding number rule to determine which regions lie inside the
clipping path.
*/
class WAsterisk extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(WAsterisk_ENFORCER),
      'Cannot instantiate PDFOperator.WAsterisk - use "WAsterisk.operator" instead',
    );
  }

  static operator = new WAsterisk(WAsterisk_ENFORCER);

  toString = () => `W*\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default WAsterisk;
