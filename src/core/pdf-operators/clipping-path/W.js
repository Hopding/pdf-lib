/* @flow */
/* eslint-disable new-cap */
import PDFOperator from '../PDFOperator';

import { addStringToBuffer } from '../../../utils';
import { validate, isIdentity } from '../../../utils/validate';

const W_ENFORCER = Symbol('W_ENFORCER');

/**
Modify the current clipping path by intersecting it with the current path, using
the nonzero winding number rule to determine which regions lie inside the
clipping path.
*/
class W extends PDFOperator {
  constructor(enforcer: Symbol) {
    super();
    validate(
      enforcer,
      isIdentity(W_ENFORCER),
      'Cannot instantiate PDFOperator.W - use "W.operator" instead',
    );
  }

  static operator = new W(W_ENFORCER);

  toString = () => `W\n`;

  bytesSize = (): number => 2;

  copyBytesInto = (buffer: Uint8Array): Uint8Array =>
    addStringToBuffer(this.toString(), buffer);
}

export default W;
