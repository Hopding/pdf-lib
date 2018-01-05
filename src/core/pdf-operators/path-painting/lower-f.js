/* @flow */
/* eslint-disable new-cap, camelcase */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const f_ENFORCER = Symbol('f_ENFORCER');

/**
Fill the path, using the nonzero winding number rule to determine the region to
fill. Any subpaths that are open shall be implicitly closed before being filled.
*/
class f extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(f_ENFORCER),
      'Cannot instantiate PDFOperator.f - use "f.operator" instead',
    );
  }

  static operator = new f(f_ENFORCER);

  toString = () => `f\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default f;
