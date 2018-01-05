/* @flow */
/* eslint-disable new-cap, camelcase */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const F_ENFORCER = Symbol('F_ENFORCER');

/**
Equivalent to f; included only for compatibility. Although PDF reader
applications shall be able to accept this operator, PDF writer applications
should use f instead.
*/
class F extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(F_ENFORCER),
      'Cannot instantiate PDFOperator.f - use "f.operator" instead',
    );
  }

  static operator = new F(F_ENFORCER);

  toString = () => `F\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default F;
