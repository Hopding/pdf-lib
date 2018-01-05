/* @flow */
/* eslint-disable new-cap, camelcase */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const b_ENFORCER = Symbol('b_ENFORCER');

/**
Close, fill, and then stroke the path, using the nonzero winding number rule to
determine the region to fill. This operator shall have the same effect as the
sequence `h B`.
*/
class b extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(b_ENFORCER),
      'Cannot instantiate PDFOperator.b - use "b.operator" instead',
    );
  }

  static operator = new b(b_ENFORCER);

  toString = () => `b\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default b;
