/* @flow */
/* eslint-disable new-cap, camelcase */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const n_ENFORCER = Symbol('n_ENFORCER');

/**
End the path object without filling or stroking it. This operator shall be a
path-painting no-op, used primarily for the side effect of changing the current
clipping path
*/
class n extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(n_ENFORCER),
      'Cannot instantiate PDFOperator.n - use "n.operator" instead',
    );
  }

  static operator = new n(n_ENFORCER);

  toString = () => `n\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default n;
